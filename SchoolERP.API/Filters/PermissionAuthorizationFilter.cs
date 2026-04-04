using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.API.Filters;

public class PermissionAuthorizationFilter : IAsyncAuthorizationFilter
{
    private readonly string _menuKey;
    private readonly bool _requiresWrite;
    private readonly ApplicationDbContext _dbContext;

    public PermissionAuthorizationFilter(string menuKey, bool requiresWrite, ApplicationDbContext dbContext)
    {
        _menuKey = menuKey;
        _requiresWrite = requiresWrite;
        _dbContext = dbContext;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (!user.Identity?.IsAuthenticated ?? true)
            return; // Rely on [Authorize] for 401

        var roleName = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;
        var userIdStr = user.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(roleName) || !Guid.TryParse(userIdStr, out var userId))
        {
            context.Result = new ForbidResult();
            return;
        }

        var orgIdStr = user.FindFirst("OrganizationId")?.Value;
        if (!Guid.TryParse(orgIdStr, out var orgId))
        {
            context.Result = new ForbidResult();
            return;
        }

        // Check if Organization has this menu enabled
        var orgMenu = await _dbContext.OrganizationMenus
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.OrganizationId == orgId && m.MenuKey == _menuKey);
            
        var hasOrgPermission = false;
        if (orgMenu == null)
        {
            // Backwards compatibility: If there are exactly zero records for this Organization in OrganizationMenu,
            // we assume everything is enabled (legacy org). If there is at least one, and it's not this one, it's disabled.
            var orgHasAny = await _dbContext.OrganizationMenus.IgnoreQueryFilters().AnyAsync(m => m.OrganizationId == orgId);
            hasOrgPermission = !orgHasAny;
        }
        else
        {
            hasOrgPermission = orgMenu.IsEnabled;
        }

        if (!hasOrgPermission)
        {
            context.Result = new ForbidResult();
            return;
        }

        // Admin fallback
        if (string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            // Give Admin pass for built-in critical modules
            var builtInModules = new[] { "students", "hr", "academics", "fees", "settings", "finance", "communication", "infrastructure", "inventory", "front_office" };
            if (builtInModules.Contains(_menuKey)) 
                return; // Admin is granted access
        }

        // Check User specific overrides first
        var userPerm = await _dbContext.MenuPermissions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.OrganizationId == orgId && p.UserId == userId && p.MenuKey == _menuKey);

        if (userPerm != null)
        {
            if (!HasRequiredAccess(userPerm))
            {
                context.Result = new ForbidResult();
            }
            return;
        }

        // Check Role specific permission
        var rolePerm = await _dbContext.MenuPermissions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.OrganizationId == orgId && p.RoleName == roleName && p.UserId == null && p.MenuKey == _menuKey);

        if (rolePerm == null || !HasRequiredAccess(rolePerm))
        {
            context.Result = new ForbidResult();
        }
    }

    private bool HasRequiredAccess(MenuPermission permission)
    {
        if (_requiresWrite) return permission.CanWrite;
        return permission.CanRead;
    }
}
