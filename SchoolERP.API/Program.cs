using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SchoolERP.API.Middleware;
using SchoolERP.API.Services;
using SchoolERP.Application.Interfaces;
using SchoolERP.Infrastructure.Persistence;
using SchoolERP.Infrastructure.Services;
using SchoolERP.Infrastructure.Settings;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Serilog Configuration
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/schoolerp-logs-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();

// Add CORS Policy for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// Swagger Config for JWT and OrganizationId
builder.Services.AddSwaggerGen();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IFeeService, FeeService>();
builder.Services.AddScoped<IFileService, FileService>();

var jwtSettings = new JwtSettings();
builder.Configuration.Bind(nameof(jwtSettings), jwtSettings);
builder.Services.AddSingleton(Microsoft.Extensions.Options.Options.Create(jwtSettings));

// Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Log.Information("Connecting to database with: {ConnectionString}", connectionString);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString,
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 10,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

// Authentication
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"]!)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// CQRS / MediatR & FluentValidation could be registered here
// builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(SchoolERP.Application.DependencyInjection).Assembly));

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try 
    {
        Log.Information("Applying database migrations...");
        context.Database.Migrate();
        Log.Information("Database migrations applied successfully.");
    } 
    catch (Exception ex)
    {
        Log.Error(ex, "Failed to apply database migrations. Ensure your connection string is correct and you have necessary permissions.");
    }

    // Essential Seed if missing
    try 
    {
        if (!context.Organizations.Any()) 
        {
            Log.Information("Seeding initial organization and admin user with full rights...");
            
            // 1. Ensure Menu Masters exist Globally
            if (!context.MenuMasters.Any())
            {
                var menus = new[] 
                {
                    new MenuMaster { Key = "dashboard", Label = "Dashboard", Icon = "LayoutDashboard", SortOrder = 1 },
                    new MenuMaster { Key = "students", Label = "Students", Icon = "Users", SortOrder = 2 },
                    new MenuMaster { Key = "academics", Label = "Academics", Icon = "GraduationCap", SortOrder = 3 },
                    new MenuMaster { Key = "fee", Label = "Fee Management", Icon = "CreditCard", SortOrder = 4 },
                    new MenuMaster { Key = "hr", Label = "Human Resource", Icon = "Briefcase", SortOrder = 5 },
                    new MenuMaster { Key = "attendance", Label = "Attendance", Icon = "CalendarCheck", SortOrder = 6 },
                    new MenuMaster { Key = "examination", Label = "Examination", Icon = "FileText", SortOrder = 7 },
                    new MenuMaster { Key = "settings", Label = "Settings", Icon = "Settings", SortOrder = 8 }
                };
                context.MenuMasters.AddRange(menus);
                context.SaveChanges();
            }

            // 2. Create Organization
            var org = new Organization {
                Id = Guid.NewGuid(),
                Name = "School ERP Demo",
                Domain = "demo.rolzen.com"
            };
            context.Organizations.Add(org);
            context.SaveChanges();

            // 3. Create Default Roles for this organization 
            var adminRole = new EmployeeRole { Name = "Admin", OrganizationId = org.Id, CreatedAt = DateTime.UtcNow };
            context.EmployeeRoles.Add(adminRole);
            context.EmployeeRoles.Add(new EmployeeRole { Name = "Teacher", OrganizationId = org.Id, CreatedAt = DateTime.UtcNow });
            context.EmployeeRoles.Add(new EmployeeRole { Name = "Staff", OrganizationId = org.Id, CreatedAt = DateTime.UtcNow });
            context.SaveChanges();

            // 4. Create Initial User
            var user = new User {
                Email = "shahbazit007@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Shahbaz@123"),
                FirstName = "Shahbaz",
                LastName = "Ahmad",
                MobileNumber = "9999999999",
                Role = "Admin",
                OrganizationId = org.Id,
                CreatedAt = DateTime.UtcNow,
                IsEmailVerified = true,
                IsMobileVerified = true
            };
            context.Users.Add(user);
            context.SaveChanges();

            // 5. Create Linked Employee Record 
            var employee = new Employee
            {
                OrganizationId = org.Id,
                FirstName = "Shahbaz",
                LastName = "Ahmad",
                WorkEmail = user.Email,
                MobileNumber = user.MobileNumber,
                DateOfJoining = DateTime.UtcNow,
                EmploymentType = EmploymentType.FullTime,
                IsActive = true,
                IsLoginEnabled = true,
                UserId = user.Id,
                EmployeeRoleId = adminRole.Id, // Link to Admin Role
            };
            context.Employees.Add(employee);
            context.SaveChanges();

            // 6. Grant Full Permissions to Admin Role
            var allMenus = context.MenuMasters.ToList();
            foreach (var menu in allMenus)
            {
                context.MenuPermissions.Add(new MenuPermission
                {
                    RoleName = "Admin",
                    MenuKey = menu.Key,
                    IsVisible = true,
                    OrganizationId = org.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }
            context.SaveChanges();

            Log.Information("Initial admin, employee roles, and full permissions seeded successfully.");
        }
        // Ensure Admin user always has access and is not locked out
        var adminEmail = "shahbazit007@gmail.com";
        var existingAdmin = context.Users.IgnoreQueryFilters().FirstOrDefault(u => u.Email == adminEmail);
        if (existingAdmin != null)
        {
            var isModified = false;
            if (existingAdmin.LockoutEnd != null)
            {
                existingAdmin.LockoutEnd = null;
                existingAdmin.FailedLoginAttempts = 0;
                Log.Information("Unlocked admin user account.");
                isModified = true;
            }

            var adminEmployee = context.Employees.IgnoreQueryFilters().FirstOrDefault(e => e.UserId == existingAdmin.Id);
            if (adminEmployee != null)
            {
                if (!adminEmployee.IsActive || !adminEmployee.IsLoginEnabled)
                {
                    adminEmployee.IsActive = true;
                    adminEmployee.IsLoginEnabled = true;
                    Log.Information("Enabled login and reactivated admin employee record.");
                    isModified = true;
                }
            }

            if (isModified)
            {
                context.SaveChanges();
            }
        }
    } 
    catch (Exception ex) 
    {
        Log.Error(ex, "Failed to seed default data or ensure admin status.");
    }
}









// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseStaticFiles();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<OrganizationMiddleware>();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
