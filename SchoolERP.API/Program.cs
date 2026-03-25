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
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Serilog Configuration
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
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
            Log.Information("Seeding initial organization and admin user...");
            var org = new Organization {
                Id = Guid.NewGuid(),
                Name = "School ERP Demo",
                Domain = "demo.rolzen.com"
            };
            context.Organizations.Add(org);
            context.SaveChanges();

            var user = new User {
                Email = "shahbazit007@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password"),
                FirstName = "Admin",
                LastName = "User",
                MobileNumber = "1234567890",
                Role = "Admin",
                OrganizationId = org.Id,
                CreatedAt = DateTime.UtcNow,
                IsEmailVerified = true,
                IsMobileVerified = true
            };
            context.Users.Add(user);
            context.SaveChanges();
            Log.Information("Initial admin seeded successfully.");
        }
    } 
    catch (Exception ex) 
    {
        Log.Error(ex, "Failed to seed default data.");
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
app.UseMiddleware<OrganizationMiddleware>();

// app.UseHttpsRedirection(); // Commented out to prevent HTTPS cert issues on localhost

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
