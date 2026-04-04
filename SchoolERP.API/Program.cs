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
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<ITransportService, TransportService>();
builder.Services.AddScoped<IHostelService, HostelService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<ILibraryService, LibraryService>();
builder.Services.AddScoped<IFinanceReportService, FinanceReportService>();
builder.Services.AddScoped<ISubjectContentService, SubjectContentService>();
builder.Services.AddHttpClient<IOpenAIService, OpenAIService>();

var jwtSettings = new JwtSettings();
builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);
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
        // 1. Ensure Menu Masters exist Globally
        var expectedMenus = new[] 
            {
                    new MenuMaster { Key = "dashboard", Label = "Dashboard", Icon = "LayoutDashboard", SortOrder = 1, Type = "Page", ParentKey = null },
                    
                    // Students Group & Pages
                    new MenuMaster { Key = "students", Label = "Students", Icon = "Users", SortOrder = 2, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "student_directory", Label = "Student Directory", SortOrder = 1, Type = "Page", ParentKey = "students" },
                    new MenuMaster { Key = "student_attendance", Label = "Daily Attendance", SortOrder = 2, Type = "Page", ParentKey = "students" },
                    new MenuMaster { Key = "student_promotion", Label = "Promotion & Transfer", SortOrder = 3, Type = "Page", ParentKey = "students" },
                    new MenuMaster { Key = "certificates", Label = "Certificate & ID", SortOrder = 4, Type = "Page", ParentKey = "students" },
                    new MenuMaster { Key = "student_import", Label = "Bulk Import", SortOrder = 5, Type = "Page", ParentKey = "students" },

                    // Academic Group & Pages
                    new MenuMaster { Key = "academic", Label = "Academics", Icon = "BookOpen", SortOrder = 3, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "examinations", Label = "Exams & Result", SortOrder = 1, Type = "Page", ParentKey = "academic" },
                    new MenuMaster { Key = "timetable", Label = "Class Timetables", SortOrder = 2, Type = "Page", ParentKey = "academic" },
                    new MenuMaster { Key = "academic_calendar", Label = "Academic Calendar", SortOrder = 3, Type = "Page", ParentKey = "academic" },

                    // Finance Group & Pages
                    new MenuMaster { Key = "finance", Label = "Finance", Icon = "Wallet", SortOrder = 4, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "finance_dashboard", Label = "Finance Dashboard", SortOrder = 1, Type = "Page", ParentKey = "finance" },
                    new MenuMaster { Key = "financials", Label = "General Ledger", SortOrder = 2, Type = "Page", ParentKey = "finance" },
                    new MenuMaster { Key = "fee_collection", Label = "Fee Collection", SortOrder = 3, Type = "Page", ParentKey = "finance" },
                    new MenuMaster { Key = "fee_structures", Label = "Fee Structures", SortOrder = 4, Type = "Page", ParentKey = "finance" },
                    new MenuMaster { Key = "fee_heads", Label = "Fee Heads", SortOrder = 5, Type = "Page", ParentKey = "finance" },
                    new MenuMaster { Key = "fee_policies", Label = "Fee Policies", SortOrder = 6, Type = "Page", ParentKey = "finance" },

                    // HR Group & Pages
                    new MenuMaster { Key = "hr", Label = "HR & Payroll", Icon = "UserCog", SortOrder = 5, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "employees", Label = "Employee List", SortOrder = 1, Type = "Page", ParentKey = "hr" },
                    new MenuMaster { Key = "teachers", Label = "Academic Staff", SortOrder = 2, Type = "Page", ParentKey = "hr" },
                    new MenuMaster { Key = "attendance", Label = "Staff Attendance", SortOrder = 3, Type = "Page", ParentKey = "hr" },
                    new MenuMaster { Key = "leaves", Label = "Leave Management", SortOrder = 4, Type = "Page", ParentKey = "hr" },
                    new MenuMaster { Key = "leave_settings", Label = "Leave Policies", SortOrder = 5, Type = "Page", ParentKey = "hr" },
                    new MenuMaster { Key = "payroll", Label = "Staff Payroll", SortOrder = 6, Type = "Page", ParentKey = "hr" },

                    // Logistics Group & Pages
                    new MenuMaster { Key = "logistics", Label = "Logistics", Icon = "Package", SortOrder = 6, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "front_office", Label = "Front Office", SortOrder = 1, Type = "Page", ParentKey = "logistics" },
                    new MenuMaster { Key = "communication", Label = "Communication", SortOrder = 2, Type = "Page", ParentKey = "logistics" },
                    new MenuMaster { Key = "inventory", Label = "Inventory & Store", SortOrder = 3, Type = "Page", ParentKey = "logistics" },
                    new MenuMaster { Key = "transport", Label = "Transport", SortOrder = 4, Type = "Page", ParentKey = "logistics" },
                    new MenuMaster { Key = "hostel", Label = "Hostel", SortOrder = 5, Type = "Page", ParentKey = "logistics" },
                    new MenuMaster { Key = "library", Label = "Library", SortOrder = 6, Type = "Page", ParentKey = "logistics" },

                    // Masters Group & Pages
                    new MenuMaster { Key = "masters", Label = "Masters", Icon = "Database", SortOrder = 7, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "academic_years", Label = "Academic Sessions", SortOrder = 1, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "classes", Label = "Class Master", SortOrder = 2, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "sections", Label = "Section Master", SortOrder = 3, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "subjects", Label = "Subject Master", SortOrder = 4, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "departments", Label = "Departments", SortOrder = 5, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "designations", Label = "Designations", SortOrder = 6, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "rooms", Label = "Infrastructure Rooms", SortOrder = 7, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "labs", Label = "Lab Master", SortOrder = 8, Type = "Page", ParentKey = "masters" },
                    new MenuMaster { Key = "lookups", Label = "General Lookups", SortOrder = 9, Type = "Page", ParentKey = "masters" },

                    // AI Curriculum Group & Pages
                    new MenuMaster { Key = "ai", Label = "AI Curriculum", Icon = "Sparkles", SortOrder = 8, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "ai_book_list", Label = "Manage Books", SortOrder = 1, Type = "Page", ParentKey = "ai" },
                    new MenuMaster { Key = "subject_content", Label = "Chapter Content", SortOrder = 2, Type = "Page", ParentKey = "ai" },
                    new MenuMaster { Key = "ai_tutor", Label = "AI Learning Tutor", SortOrder = 3, Type = "Page", ParentKey = "ai" },

                    // Administration Group & Pages
                    new MenuMaster { Key = "admin", Label = "Administration", Icon = "Settings", SortOrder = 9, Type = "Group", ParentKey = null },
                    new MenuMaster { Key = "organization_settings", Label = "Organization Settings", SortOrder = 1, Type = "Page", ParentKey = "admin" },
                    new MenuMaster { Key = "users", Label = "User Management", SortOrder = 2, Type = "Page", ParentKey = "admin" },
                    new MenuMaster { Key = "permissions", Label = "Role Permissions", SortOrder = 3, Type = "Page", ParentKey = "admin" },
                    new MenuMaster { Key = "setup", Label = "System Setup", SortOrder = 4, Type = "Page", ParentKey = "admin" }
            };

            var existingMenus = context.MenuMasters.ToList();
            bool menusUpdated = false;
            foreach (var em in expectedMenus)
            {
                var existing = existingMenus.FirstOrDefault(m => m.Key == em.Key);
                if (existing == null)
                {
                    context.MenuMasters.Add(em);
                    menusUpdated = true;
                }
                else
                {
                    // Update existing with new hierarchy details
                    existing.Type = em.Type;
                    existing.ParentKey = em.ParentKey;
                    existing.Label = em.Label;
                    existing.SortOrder = em.SortOrder;
                    menusUpdated = true;
                }
            }
            if (menusUpdated)
            {
                context.SaveChanges();
            }
        if (!context.Organizations.Any()) 
        {
            Log.Information("Seeding initial organization and admin user with full rights...");
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
                context.OrganizationMenus.Add(new OrganizationMenu
                {
                    MenuKey = menu.Key,
                    IsEnabled = true,
                    OrganizationId = org.Id,
                    CreatedAt = DateTime.UtcNow
                });

                context.MenuPermissions.Add(new MenuPermission
                {
                    RoleName = "Admin",
                    MenuKey = menu.Key,
                    CanRead = true,
                    CanWrite = true,
                    OrganizationId = org.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }
            context.SaveChanges();

            Log.Information("Initial admin, employee roles, and full permissions seeded successfully.");
        }

        // Always seed some financial accounts if none exist for the first org
        if (!context.FinancialAccounts.IgnoreQueryFilters().Any())
        {
            var org = context.Organizations.FirstOrDefault();
            if (org != null)
            {
                context.FinancialAccounts.AddRange(new[] {
                    new FinancialAccount { Name = "Cash Counter 1", AccountType = "Cash", Description = "Main Admission Counter", IsActive = true, OrganizationId = org.Id },
                    new FinancialAccount { Name = "Cash Counter 2", AccountType = "Cash", Description = "General Fees Counter", IsActive = true, OrganizationId = org.Id },
                    new FinancialAccount { Name = "Main Bank A/C", AccountType = "Bank", Description = "Central School Fund Account", IsActive = true, OrganizationId = org.Id }
                });
                context.SaveChanges();
            }
        }
        // Ensure Admin user always has access and is not locked out
        var adminEmail = "shahbazit007@gmail.com";
        var existingAdmin = context.Users.IgnoreQueryFilters().FirstOrDefault(u => u.Email == adminEmail);
        if (existingAdmin != null)
        {
            var isModified = false;

            // Ensure OrganizationId is valid for the admin (fixes 404 on dashboard after manual DB resets)
            var orgExists = context.Organizations.Any(o => o.Id == existingAdmin.OrganizationId);
            if (!orgExists)
            {
                var firstOrg = context.Organizations.FirstOrDefault();
                if (firstOrg != null)
                {
                    existingAdmin.OrganizationId = firstOrg.Id;
                    Log.Warning("Repaired broken OrganizationId for user {Email}. Linked to {OrgName}.", adminEmail, firstOrg.Name);
                    isModified = true;
                }
            }

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

            // Sync nested menus for Admin
            var allMenusForSync = context.MenuMasters.ToList();
            if (existingAdmin.OrganizationId != Guid.Empty)
            {
                var orgMenusSync = context.OrganizationMenus.IgnoreQueryFilters().Where(om => om.OrganizationId == existingAdmin.OrganizationId).ToList();
                var adminPermsSync = context.MenuPermissions.IgnoreQueryFilters().Where(mp => mp.RoleName == "Admin" && mp.OrganizationId == existingAdmin.OrganizationId).ToList();
                var permsUpdated = false;

                foreach (var menu in allMenusForSync)
                {
                    if (!orgMenusSync.Any(m => m.MenuKey == menu.Key))
                    {
                        context.OrganizationMenus.Add(new OrganizationMenu { MenuKey = menu.Key, IsEnabled = true, OrganizationId = existingAdmin.OrganizationId, CreatedAt = DateTime.UtcNow });
                        permsUpdated = true;
                    }
                    if (!adminPermsSync.Any(m => m.MenuKey == menu.Key))
                    {
                        context.MenuPermissions.Add(new MenuPermission { RoleName = "Admin", MenuKey = menu.Key, CanRead = true, CanWrite = true, OrganizationId = existingAdmin.OrganizationId, CreatedAt = DateTime.UtcNow });
                        permsUpdated = true;
                    }
                }
                if (permsUpdated)
                {
                    context.SaveChanges();
                    Log.Information("Synchronized missing hierarchy menus for Admin and Organization.");
                }
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
