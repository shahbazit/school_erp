namespace SchoolERP.Application.Interfaces;

public class AuthResult
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();
}

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(string email, string password, string mobileNumber, string firstName, string lastName, string role, Guid organizationId);
    Task<AuthResult> LoginAsync(string email, string password, Guid? organizationId);
    Task<AuthResult> RefreshTokenAsync(string token, string refreshToken);
    Task<bool> GenerateOtpAsync(string mobileNumber, Guid organizationId);
    Task<AuthResult> VerifyOtpAsync(string mobileNumber, string otp, Guid organizationId);
    Task<AuthResult> RegisterStepOneAsync(string email, string password, string mobileNumber, string firstName, string lastName);
    Task<AuthResult> FinalizeRegistrationAsync(Guid registrationUid, string schoolName, string schoolDomain, string city, string address, string otp);
    Task<AuthResult> ForgotPasswordAsync(string email, Guid? organizationId = null);
    Task<AuthResult> ResetPasswordAsync(string email, string token, string newPassword, Guid? organizationId = null);
}
