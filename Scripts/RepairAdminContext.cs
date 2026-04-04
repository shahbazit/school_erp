using Microsoft.EntityFrameworkCore;
using SchoolERP.Infrastructure.Persistence;
using SchoolERP.Domain.Entities;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationConfiguredBuilder(args); // Helper or manual setup
// Actually I'll just use a simpler script using existing project context

// Manual setup of DbContext
var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
optionsBuilder.UseSqlServer("Server=115.124.106.157;Database=Rol_SchoolERP;User Id=RolzenDBAdmin;Password=Ahmad@786$123;MultipleActiveResultSets=True;TrustServerCertificate=True");

using var context = new ApplicationDbContext(optionsBuilder.Options, null!, null!);
var adminEmail = "shahbazit007@gmail.com";

Console.WriteLine($"Checking user {adminEmail}...");
var user = context.Users.IgnoreQueryFilters().FirstOrDefault(u => u.Email == adminEmail);

if (user == null) {
    Console.WriteLine("User not found!");
} else {
    Console.WriteLine($"User found. OrgId: {user.OrganizationId}");
    var org = context.Organizations.FirstOrDefault(o => o.Id == user.OrganizationId);
    if (org == null) {
        Console.WriteLine("CRITICAL: Organization not found for this user!");
        var firstOrg = context.Organizations.FirstOrDefault();
        if (firstOrg != null) {
            Console.WriteLine($"Fixing user OrgId to {firstOrg.Id} ({firstOrg.Name})");
            user.OrganizationId = firstOrg.Id;
            context.SaveChanges();
            Console.WriteLine("User fixed.");
        } else {
            Console.WriteLine("No organizations exist in DB at all!");
        }
    } else {
        Console.WriteLine($"Organization found: {org.Name}");
    }
}
