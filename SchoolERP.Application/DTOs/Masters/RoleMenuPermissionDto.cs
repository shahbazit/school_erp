using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Masters;

public class MenuPermissionDto
{
    public string? RoleName { get; set; }
    public Guid? UserId { get; set; }
    
    [Required]
    public string MenuKey { get; set; } = string.Empty;
    
    public bool CanRead { get; set; }
    public bool CanWrite { get; set; }
}

public class UpdateMenuPermissionsDto
{
    public string? RoleName { get; set; }
    public Guid? UserId { get; set; }
    public List<MenuPermissionItemDto> Permissions { get; set; } = new();
}

public class MenuPermissionItemDto
{
    public string MenuKey { get; set; } = string.Empty;
    public bool CanRead { get; set; }
    public bool CanWrite { get; set; }
}
