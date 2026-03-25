using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
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

        // This is used for EF Core Migrations (dotnet ef database update)
        // Ensure this matches the database in SchoolERP.API/appsettings.json
        optionsBuilder.UseSqlServer(
            "Server=DESKTOP-I9E18U8;Database=SchoolERP;Integrated Security=True;MultipleActiveResultSets=True;TrustServerCertificate=True",
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
