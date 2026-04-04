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
            .Where(p => p.RoleName == roleName && p.UserId == null)
            .Select(p => new MenuPermissionItemDto { MenuKey = p.MenuKey, CanRead = p.CanRead, CanWrite = p.CanWrite })
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPermissions(string userId)
    {
        // Resilient check for GUID format (prevents 400 errors from stale frontend IDs)
        if (!Guid.TryParse(userId, out var userGuid))
        {
            Serilog.Log.Warning("GetPermissionsByUser: Invalid User ID format provided: {UserId}", userId);
            return NotFound(new { message = "Invalid User ID format." });
        }

        var user = await _unitOfWork.Repository<User>().GetQueryable()
            .FirstOrDefaultAsync(u => u.Id == userGuid);
        
        if (user == null) return NotFound("User not found");

        var rolePerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.RoleName == user.Role && p.UserId == null)
            .Select(p => new MenuPermissionItemDto { MenuKey = p.MenuKey, CanRead = p.CanRead, CanWrite = p.CanWrite })
            .ToListAsync();

        var userPerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.UserId == userGuid)
            .Select(p => new MenuPermissionItemDto { MenuKey = p.MenuKey, CanRead = p.CanRead, CanWrite = p.CanWrite })
            .ToListAsync();

        // user perms override role perms completely for that menu key
        var resultDict = rolePerms.ToDictionary(p => p.MenuKey, p => p);
        foreach (var up in userPerms)
        {
            resultDict[up.MenuKey] = up;
        }

        return Ok(new { 
            hasOverrides = userPerms.Any(), 
            permissions = resultDict.Values.ToList() 
        });
    }

    [HttpGet("menus")]
    public async Task<IActionResult> GetAllMenus()
    {
        var menus = await _unitOfWork.GlobalRepository<MenuMaster>().GetQueryable()
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();
            
        return Ok(menus);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyPermissions()
    {
        var roleName = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
        var userIdStr = User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(roleName) || !Guid.TryParse(userIdStr, out var userId))
            return BadRequest("Could not identify user from token");

        // 1. Get Organization Menu (Allowlist)
        var orgMenus = await _unitOfWork.Repository<OrganizationMenu>().GetQueryable()
            .Where(m => m.IsEnabled)
            .Select(m => m.MenuKey)
            .ToListAsync();

        // 2. Fetch User and Role permissions
        var rolePerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.RoleName == roleName && p.UserId == null)
            .Select(p => new MenuPermissionItemDto { MenuKey = p.MenuKey, CanRead = p.CanRead, CanWrite = p.CanWrite })
            .ToListAsync();

        var userPerms = await _unitOfWork.Repository<MenuPermission>().GetQueryable()
            .Where(p => p.UserId == userId)
            .Select(p => new MenuPermissionItemDto { MenuKey = p.MenuKey, CanRead = p.CanRead, CanWrite = p.CanWrite })
            .ToListAsync();

        // Use GroupBy to avoid duplicate key exceptions in ToDictionary
        var resultDict = rolePerms
            .GroupBy(p => p.MenuKey)
            .ToDictionary(g => g.Key, g => g.First());

        foreach (var up in userPerms)
        {
            resultDict[up.MenuKey] = up;
        }

        // AUTO-ENABLE full access for ADMIN by default to prevent lockout if missing seeded perms
        if (string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            var adminDefaults = new HashSet<string> { 
                "dashboard", "students", "student_directory", "student_attendance", "student_promotion", "certificates", "student_import",
                "academic", "examinations", "timetable", "academic_calendar",
                "finance", "finance_dashboard", "financials", "fee_collection", "fee_structures", "fee_heads", "fee_policies",
                "hr", "employees", "teachers", "attendance", "leaves", "leave_settings", "payroll",
                "logistics", "front_office", "communication", "inventory", "transport", "hostel", "library",
                "masters", "academic_years", "classes", "sections", "subjects", "departments", "designations", "rooms", "labs", "lookups",
                "ai", "ai_book_list", "subject_content", "ai_tutor",
                "admin", "organization_settings", "users", "permissions", "setup" 
            };
            foreach(var key in adminDefaults) 
            {
                if (!resultDict.ContainsKey(key))
                {
                    resultDict[key] = new MenuPermissionItemDto { MenuKey = key, CanRead = true, CanWrite = true };
                }
            }
        }

        var finalPermissions = resultDict.Values.ToList();

        // Only return menus that are enabled by the Organization (Allowlist)
        if (orgMenus.Count > 0)
        {
            var allowedKeys = orgMenus.ToHashSet();
            finalPermissions = finalPermissions.Where(p => allowedKeys.Contains(p.MenuKey)).ToList();
        }

        return Ok(new { 
            hasOverrides = userPerms.Any(), 
            permissions = finalPermissions 
        });
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

        // If Reset operation (empty list), we just cleared everything above.
        if (dto.Permissions == null || dto.Permissions.Count == 0)
        {
             return Ok(new { message = "Individual overrides cleared. User will now inherit from Role." });
        }
        // Add new
        foreach (var item in dto.Permissions)
        {
            await _unitOfWork.Repository<MenuPermission>().AddAsync(new MenuPermission
            {
                RoleName = dto.RoleName,
                UserId = dto.UserId,
                MenuKey = item.MenuKey,
                CanRead = item.CanRead,
                CanWrite = item.CanWrite
            });
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Permissions updated successfully" });
    }

    [HttpGet("organization")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrganizationMenus()
    {
        var orgMenus = await _unitOfWork.Repository<OrganizationMenu>().GetQueryable()
            .ToListAsync();
        return Ok(orgMenus);
    }

    [HttpPost("organization")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrganizationMenus([FromBody] List<string> enabledMenuKeys)
    {
        var existing = await _unitOfWork.Repository<OrganizationMenu>().GetQueryable().ToListAsync();
        
        foreach(var m in existing)
        {
            _unitOfWork.Repository<OrganizationMenu>().Delete(m);
        }

        foreach(var key in enabledMenuKeys)
        {
            await _unitOfWork.Repository<OrganizationMenu>().AddAsync(new OrganizationMenu 
            {
                MenuKey = key,
                IsEnabled = true
            });
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Organization menus updated successfully" });
    }
}
