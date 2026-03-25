using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Lookup;

public class LookupDto
{
    public Guid Id { get; set; }
    public LookupType Type { get; set; }
    public string TypeName => Type.ToString();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
