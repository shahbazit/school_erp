using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.Infrastructure.Persistence;

/// Provides a DbContext instance for EF Core design-time tools (migrations).
/// Uses stub implementations of IOrganizationService and ICurrentUserService so that
/// the EF tooling doesn't need the full DI container.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        // Build configuration similar to how the WebHost does it.
        // We look for appsettings.json in the API project directory.
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "SchoolERP.API");
        if (!Directory.Exists(basePath))
        {
            // Fallback for cases where CWD is already API or something else
            basePath = Directory.GetCurrentDirectory();
        }

        var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        optionsBuilder.UseSqlServer(
            connectionString,
            sqlServerOptionsAction: b => 
            {
                b.MigrationsAssembly("SchoolERP.Infrastructure");
                b.EnableRetryOnFailure();
            });

        return new ApplicationDbContext(
            optionsBuilder.Options,
            new StubOrganizationService(),
            new StubCurrentUserService());
    }
}

// ── Stubs ──────────────────────────────────────────────────────────────────

internal class StubOrganizationService : IOrganizationService
{
    public Guid GetOrganizationId() => Guid.Empty;
}

internal class StubCurrentUserService : ICurrentUserService
{
    public Guid? UserId => null;
}
