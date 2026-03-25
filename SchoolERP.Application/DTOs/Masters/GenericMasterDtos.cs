using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Masters;

// Request DTOs
public class CreateMasterDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateMasterDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

// Response DTO
public class MasterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
