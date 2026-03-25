using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Masters;

public class MenuPermissionDto
{
    public string? RoleName { get; set; }
    public Guid? UserId { get; set; }
    
    [Required]
    public string MenuKey { get; set; } = string.Empty;
    
    public bool IsVisible { get; set; }
}

public class UpdateMenuPermissionsDto
{
    public string? RoleName { get; set; }
    public Guid? UserId { get; set; }
    public List<string> MenuKeys { get; set; } = new();
}
