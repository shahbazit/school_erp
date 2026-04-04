using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;
using SchoolERP.Infrastructure.Settings;
using SchoolERP.Domain.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Serilog;

namespace SchoolERP.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;
    private readonly IEmailService _emailService;

    // Mobile OTP store (in-memory is sufficient for SMS OTP login flow)
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, string> _mobileOtpStore = new();

    public AuthService(ApplicationDbContext dbContext, IOptions<JwtSettings> jwtSettings, IEmailService emailService)
    {
        _dbContext = dbContext;
        _jwtSettings = jwtSettings.Value;
        _emailService = emailService;
    }

    public async Task<AuthResult> RegisterAsync(string email, string password, string mobileNumber, string firstName, string lastName, string role, Guid organizationId)
    {
        var existingUser = await _dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email && u.OrganizationId == organizationId);
        if (existingUser != null)
        {
            return new AuthResult { Success = false, Errors = new[] { "User already exists in this organization" } };
        }

        var user = new User
        {
            Email = email,
            MobileNumber = mobileNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FirstName = firstName,
            LastName = lastName,
            Role = role,
            OrganizationId = organizationId,
            IsMobileVerified = true, 
            IsEmailVerified = true,
            HasConsentedToTerms = true,
            ConsentDate = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return await GenerateAuthenticationResultForUserAsync(user);
    }

    public async Task<AuthResult> RegisterStepOneAsync(string email, string password, string mobileNumber, string firstName, string lastName)
    {
        // 1. Check if user already exists
        var existingUser = await _dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email);
        if (existingUser != null)
        {
            return new AuthResult { Success = false, Errors = new[] { "User with this email already exists." } };
        }

        // 2. Check if already in pending (update if exists)
        var pending = await _dbContext.PendingRegistrations.FirstOrDefaultAsync(p => p.Email == email);
        if (pending == null)
        {
            pending = new PendingRegistration
            {
                Email = email,
                Name = $"{firstName} {lastName}",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Mobile = mobileNumber,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.PendingRegistrations.Add(pending);
        }
        else
        {
            pending.Name = $"{firstName} {lastName}";
            pending.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            pending.Mobile = mobileNumber;
            _dbContext.PendingRegistrations.Update(pending);
        }

        await _dbContext.SaveChangesAsync();

        // 3. Generate OTP and save it to the database (not in-memory)
        var otp = new Random().Next(100000, 999999).ToString();
        pending.OtpCode = otp;
        pending.OtpExpiry = DateTime.UtcNow.AddMinutes(10); // valid for 10 minutes
        await _dbContext.SaveChangesAsync();

        try
        {
            await _emailService.SendOtpEmailAsync(email, firstName, otp);
        }
        catch (System.Exception ex)
        {
            // Development fallback: OTP is in DB & console. Check dotnet logs.
            Log.Warning("Registration OTP email could not be sent to {Email}: {Error}. Fallback OTP is {Otp}", email, ex.Message, otp);
        }

        return new AuthResult 
        { 
            Success = true, 
            Token = pending.UID.ToString(), // Returning UID for step 2
            Errors = new[] { "Step 1 successful. OTP sent to email." } 
        };
    }

    public async Task<AuthResult> FinalizeRegistrationAsync(Guid registrationUid, string schoolName, string schoolDomain, string city, string address, string otp)
    {
        var pending = await _dbContext.PendingRegistrations.FirstOrDefaultAsync(p => p.UID == registrationUid);
        if (pending == null)
        {
            return new AuthResult { Success = false, Errors = new[] { "Registration request not found." } };
        }

        // Verify OTP from database
        if (string.IsNullOrEmpty(pending.OtpCode) ||
            pending.OtpCode != otp ||
            pending.OtpExpiry == null ||
            pending.OtpExpiry < DateTime.UtcNow)
        {
            return new AuthResult { Success = false, Errors = new[] { "Invalid or expired OTP. Please request a new one." } };
        }

        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Create Organization
                var organization = new SchoolERP.Domain.Entities.Organization
                {
                    Name = schoolName,
                    Domain = schoolDomain,
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.Organizations.Add(organization);
                await _dbContext.SaveChangesAsync();

                // 2. Create Employee Roles Master
                var roleNames = new[] { "Admin", "Teacher", "Accountant", "Staff" };
                EmployeeRole? adminRole = null;
                foreach (var roleName in roleNames)
                {
                    var er = new EmployeeRole { Name = roleName, OrganizationId = organization.Id, CreatedAt = DateTime.UtcNow };
                    _dbContext.EmployeeRoles.Add(er);
                    if (roleName == "Admin") adminRole = er;
                }
                await _dbContext.SaveChangesAsync();

                // 3. Create Admin User
                var names = pending.Name.Split(' ', 2);
                var user = new User
                {
                    Email = pending.Email,
                    MobileNumber = pending.Mobile ?? "",
                    PasswordHash = pending.PasswordHash,
                    FirstName = names[0],
                    LastName = names.Length > 1 ? names[1] : "",
                    Role = "Admin",
                    OrganizationId = organization.Id,
                    IsEmailVerified = true,
                    IsMobileVerified = true,
                    HasConsentedToTerms = true,
                    ConsentDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();

                // 4. Create Linked Employee Record
                var employee = new Employee
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    WorkEmail = user.Email,
                    MobileNumber = user.MobileNumber,
                    EmployeeCode = $"EMP-{DateTime.Now.Date:yyyyMMdd}-001",
                    DateOfJoining = DateTime.UtcNow.Date,
                    OrganizationId = organization.Id,
                    UserId = user.Id,
                    EmployeeRoleId = adminRole?.Id,
                    IsActive = true,
                    IsLoginEnabled = true,
                    Status = EmployeeStatus.Active,
                    EmploymentType = EmploymentType.FullTime,
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.Employees.Add(employee);

                // 5. Mark Pending as Deleted
                _dbContext.PendingRegistrations.Remove(pending);

                // 6. Seed Default Admin Permissions (FROM MENU MASTER)
                var allMenus = await _dbContext.MenuMasters.Where(m => m.IsActive).ToListAsync();
                foreach (var menu in allMenus)
                {
                    _dbContext.MenuPermissions.Add(new MenuPermission
                    {
                        RoleName = "Admin",
                        MenuKey = menu.Key,
                        IsVisible = true,
                        OrganizationId = organization.Id,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GenerateAuthenticationResultForUserAsync(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResult { Success = false, Errors = new[] { "Finalization failed: " + ex.Message } };
            }
        });
    }

    public async Task<AuthResult> LoginAsync(string email, string password, Guid? organizationId)
    {
        var query = _dbContext.Users.IgnoreQueryFilters().AsQueryable();
        
        if (organizationId.HasValue && organizationId.Value != Guid.Empty)
        {
            query = query.Where(u => u.Email == email && u.OrganizationId == organizationId.Value);
        }
        else
        {
            query = query.Where(u => u.Email == email);
        }

        var user = await query.FirstOrDefaultAsync();
        if (user == null)
            return new AuthResult { Success = false, Errors = new[] { "Invalid email, password, or organization" } };

        // Check Employee linkage and status
        var employee = await _dbContext.Employees.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (employee != null)
        {
            if (!employee.IsActive)
                 return new AuthResult { Success = false, Errors = new[] { "Your account is locked. Please contact HR." } };
            
            if (!employee.IsLoginEnabled)
                 return new AuthResult { Success = false, Errors = new[] { "System access is disabled for your account." } };
        }

        // if (!user.IsEmailVerified)
        //    return new AuthResult { Success = false, Errors = new[] { "Email is not verified. Please verify OTP first." } };

        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            return new AuthResult { Success = false, Errors = new[] { "Account locked due to multiple failed attempts. Try again later." } };

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!isPasswordValid)
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 10)
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
            
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();

            return new AuthResult { Success = false, Errors = new[] { "Invalid email or password" } };
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        user.LastLoginAt = DateTime.UtcNow;
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        return await GenerateAuthenticationResultForUserAsync(user);
    }

    public async Task<AuthResult> RefreshTokenAsync(string token, string refreshToken)
    {
        var validatedToken = GetPrincipalFromToken(token);
        if (validatedToken == null)
            return new AuthResult { Success = false, Errors = new[] { "Invalid token" } };

        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);
        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return new AuthResult { Success = false, Errors = new[] { "Invalid token" } };
        }

        // Check organization status
        var organization = await _dbContext.Organizations.FindAsync(user.OrganizationId);
        if (organization == null || organization.IsDeleted || !organization.IsActive)
        {
            return new AuthResult { Success = false, Errors = new[] { "Organization is inactive or does not exist." } };
        }

        return await GenerateAuthenticationResultForUserAsync(user);
    }

    private async Task<AuthResult> GenerateAuthenticationResultForUserAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

        SchoolERP.Domain.Entities.Organization org = await _dbContext.Organizations.FindAsync(user.OrganizationId);
        var orgName = org?.Name ?? "Unknown Org";

        var claims = new List<System.Security.Claims.Claim>
        {
            new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new System.Security.Claims.Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new System.Security.Claims.Claim(JwtRegisteredClaimNames.Email, user.Email),
            new System.Security.Claims.Claim("id", user.Id.ToString()),
            new System.Security.Claims.Claim("OrganizationId", user.OrganizationId.ToString()),
            new System.Security.Claims.Claim("OrganizationName", orgName),
            new System.Security.Claims.Claim("Name", $"{user.FirstName} {user.LastName}"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role)
        };

        if (user.Role.Equals("Student", StringComparison.OrdinalIgnoreCase))
        {
            var student = await _dbContext.Students
                .Include(s => s.AcademicRecords)
                .FirstOrDefaultAsync(s => s.Email == user.Email || s.MobileNumber == user.MobileNumber);

            if (student != null)
            {
                claims.Add(new System.Security.Claims.Claim("StudentId", student.Id.ToString()));
                var currentAcademic = student.AcademicRecords.FirstOrDefault(a => a.IsCurrent);
                if (currentAcademic != null)
                {
                    claims.Add(new System.Security.Claims.Claim("AcademicClassId", currentAcademic.ClassId.ToString()));
                }
            }
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.Add(_jwtSettings.TokenLifetime),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMonths(1);
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        return new AuthResult
        {
            Success = true,
            Token = tokenHandler.WriteToken(token),
            RefreshToken = refreshToken
        };
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal? GetPrincipalFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.Secret)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false // Here we are saying that we don't care about the token's expiration date since we are going to refresh it
            }, out var validatedToken);

            if (!IsJwtWithValidSecurityAlgorithm(validatedToken))
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private bool IsJwtWithValidSecurityAlgorithm(SecurityToken validatedToken)
    {
        return (validatedToken is JwtSecurityToken jwtSecurityToken) &&
               jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase);
    }

    public async Task<bool> GenerateOtpAsync(string mobileNumber, Guid organizationId)
    {
        // 1. Check organization status
        var organization = await _dbContext.Organizations.FindAsync(organizationId);
        if (organization == null || organization.IsDeleted || !organization.IsActive)
        {
            return false;
        }

        var user = await _dbContext.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.MobileNumber == mobileNumber && u.OrganizationId == organizationId);
            
        if (user == null) return false;

        // Generate 6-digit OTP
        var otp = new Random().Next(100000, 999999).ToString();
        var otpKey = $"{organizationId}_{mobileNumber}";
        
        _mobileOtpStore.AddOrUpdate(otpKey, otp, (k, v) => otp);
        
        // SMS Gateway integration goes here.
        Console.WriteLine($"[SMS Simulated Sandbox] Sending OTP {otp} to {mobileNumber}");
        
        return true;
    }

    public async Task<AuthResult> VerifyOtpAsync(string mobileNumber, string otp, Guid organizationId)
    {
        // 1. Check organization status
        var organization = await _dbContext.Organizations.FindAsync(organizationId);
        if (organization == null || organization.IsDeleted || !organization.IsActive)
        {
            return new AuthResult { Success = false, Errors = new[] { "Organization is inactive or does not exist." } };
        }

        var otpKey = $"{organizationId}_{mobileNumber}";
        
        if (_mobileOtpStore.TryGetValue(otpKey, out var storedOtp) && storedOtp == otp)
        {
            var user = await _dbContext.Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.MobileNumber == mobileNumber && u.OrganizationId == organizationId);
            
            if (user != null)
            {
                user.IsMobileVerified = true;
                _dbContext.Users.Update(user);
                await _dbContext.SaveChangesAsync();
                
                _mobileOtpStore.TryRemove(otpKey, out _); // clear OTP
                
                return await GenerateAuthenticationResultForUserAsync(user);
            }
        }
        
        return new AuthResult { Success = false, Errors = new[] { "Invalid or expired OTP" } };
    }

    public async Task<AuthResult> ForgotPasswordAsync(string email, Guid? organizationId = null)
    {
        var query = _dbContext.Users.IgnoreQueryFilters().Where(u => u.Email == email);
        if (organizationId.HasValue && organizationId.Value != Guid.Empty)
        {
            query = query.Where(u => u.OrganizationId == organizationId.Value);
        }
        
        var user = await query.FirstOrDefaultAsync();
            
        if (user == null)
        {
            // Do not reveal that the user does not exist
            return new AuthResult { Success = true };
        }

        user.ResetPasswordToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        user.ResetPasswordExpiry = DateTime.UtcNow.AddHours(1);
        
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", user.ResetPasswordToken);
        }
        catch (Exception ex)
        {
            Log.Warning("Password reset email could not be sent to {Email}: {Error}. Token is {Token}", email, ex.Message, user.ResetPasswordToken);
        }

        return new AuthResult { Success = true };
    }

    public async Task<AuthResult> ResetPasswordAsync(string email, string token, string newPassword, Guid? organizationId = null)
    {
        var query = _dbContext.Users.IgnoreQueryFilters().Where(u => u.Email == email && u.ResetPasswordToken == token);
        if (organizationId.HasValue && organizationId.Value != Guid.Empty)
        {
            query = query.Where(u => u.OrganizationId == organizationId.Value);
        }

        var user = await query.FirstOrDefaultAsync();

        if (user == null || user.ResetPasswordExpiry < DateTime.UtcNow)
        {
            return new AuthResult { Success = false, Errors = new[] { "Invalid or expired password reset token." } };
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.ResetPasswordToken = null;
        user.ResetPasswordExpiry = null;
        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;

        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        return new AuthResult { Success = true, Errors = new[] { "Password reset successfully." } };
    }
    public async Task<SchoolERP.Domain.Entities.Organization?> GetOrganizationByDomainAsync(string domain)
    {
        return await _dbContext.Organizations.FirstOrDefaultAsync(o => o.Domain == domain && !o.IsDeleted && o.IsActive);
    }
}
