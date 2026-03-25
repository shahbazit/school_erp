using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Masters;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PermissionController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOrganizationService _organizationService;

    public PermissionController(IUnitOfWork unitOfWork, IOrganizationService organizationService)
    {
        _unitOfWork = unitOfWork;
        _organizationService = organizationService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _unitOfWork.Repository<User>().GetQueryable()
            .Select(u => new { u.Id, Name = $"{u.FirstName} {u.LastName}", u.Email, u.Role })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("role/{roleName}")]
    public async Task<IActionResult> GetRolePermissions(string roleName)
    {
        var permissions = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.RoleName == roleName && p.UserId == null && p.IsVisible)
            .Select(p => p.MenuKey)
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPermissions(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>().GetQueryable()
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        if (user == null) return NotFound("User not found");

        var rolePerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.RoleName == user.Role && p.UserId == null && p.IsVisible)
            .Select(p => p.MenuKey)
            .ToListAsync();

        var userPerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.UserId == userId)
            .ToListAsync();

        var result = new HashSet<string>(rolePerms);
        foreach (var up in userPerms)
        {
            if (up.IsVisible) result.Add(up.MenuKey);
            else result.Remove(up.MenuKey);
        }

        return Ok(result.ToList());
    }

    [HttpGet("menus")]
    public async Task<IActionResult> GetAllMenus()
    {
        var menus = await _unitOfWork.GlobalRepository<MenuMaster>().GetQueryable()
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();
            
        // Add hardcoded new modules if not present in DB
        var keys = menus.Select(m => m.Key).ToHashSet();
        if (!keys.Contains("students")) menus.Add(new MenuMaster { Key = "students", Label = "Academic Hub", Icon = "backpack", SortOrder = 1, IsActive = true });
        if (!keys.Contains("hr")) menus.Add(new MenuMaster { Key = "hr", Label = "Human Resources", Icon = "user-cog", SortOrder = 2, IsActive = true });
        if (!keys.Contains("academics")) menus.Add(new MenuMaster { Key = "academics", Label = "Academics", Icon = "book-open", SortOrder = 3, IsActive = true });
        if (!keys.Contains("fees")) menus.Add(new MenuMaster { Key = "fees", Label = "Fees & Accounts", Icon = "dollar-sign", SortOrder = 4, IsActive = true });
        if (!keys.Contains("front_office")) menus.Add(new MenuMaster { Key = "front_office", Label = "Admission & Reception", Icon = "building-2", SortOrder = 5, IsActive = true });
        if (!keys.Contains("finance")) menus.Add(new MenuMaster { Key = "finance", Label = "Finance & Ledger", Icon = "wallet", SortOrder = 6, IsActive = true });
        if (!keys.Contains("communication")) menus.Add(new MenuMaster { Key = "communication", Label = "Communication Hub", Icon = "message-circle", SortOrder = 7, IsActive = true });
        if (!keys.Contains("infrastructure")) menus.Add(new MenuMaster { Key = "infrastructure", Label = "Infrastructure", Icon = "truck", SortOrder = 8, IsActive = true });
        if (!keys.Contains("inventory")) menus.Add(new MenuMaster { Key = "inventory", Label = "Inventory & Store", Icon = "package", SortOrder = 9, IsActive = true });
        if (!keys.Contains("settings")) menus.Add(new MenuMaster { Key = "settings", Label = "System Settings", Icon = "settings", SortOrder = 10, IsActive = true });

        return Ok(menus);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyPermissions()
    {
        var roleName = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
        var userIdStr = User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(roleName) || !Guid.TryParse(userIdStr, out var userId))
            return BadRequest("Could not identify user from token");

        // User specific permissions override or add to role permissions
        var rolePerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.RoleName == roleName && p.UserId == null && p.IsVisible)
            .Select(p => p.MenuKey)
            .ToListAsync();

        var userPerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.UserId == userId)
            .ToListAsync();

        // If user has specific settings, they take priority
        var result = new HashSet<string>(rolePerms);
        foreach (var up in userPerms)
        {
            if (up.IsVisible) result.Add(up.MenuKey);
            else result.Remove(up.MenuKey);
        }

        // AUTO-ENABLE new modules for ADMIN
        if (string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            result.Add("finance");
            result.Add("communication");
            result.Add("infrastructure");
            result.Add("inventory");
        }

        // FALLBACK FOR ADMIN: If no permissions exist at all for this organization/role, 
        // give all modules by default so existing users are not broken.
        if (rolePerms.Count == 0 && userPerms.Count == 0 && string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new[] { "students", "hr", "academics", "fees", "settings", "finance", "communication", "infrastructure", "inventory", "front_office" });
        }

        return Ok(result.ToList());
    }

    [HttpPost("update")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePermissions([FromBody] UpdateMenuPermissionsDto dto)
    {
        if (string.IsNullOrEmpty(dto.RoleName) && !dto.UserId.HasValue)
            return BadRequest("RoleName or UserId must be provided");

        // Remove existing
        var query = _unitOfWork.Repository<MenuPermission>().GetQueryable();
        if (dto.UserId.HasValue)
            query = query.Where(p => p.UserId == dto.UserId.Value);
        else
            query = query.Where(p => p.RoleName == dto.RoleName && p.UserId == null);

        var existing = await query.ToListAsync();
        foreach (var p in existing)
        {
            _unitOfWork.Repository<MenuPermission>().Delete(p);
        }

        // Add new
        foreach (var key in dto.MenuKeys)
        {
            await _unitOfWork.Repository<MenuPermission>().AddAsync(new MenuPermission
            {
                RoleName = dto.RoleName,
                UserId = dto.UserId,
                MenuKey = key,
                IsVisible = true
            });
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Permissions updated successfully" });
    }
}
