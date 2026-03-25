using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Lab : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Physics Lab, Computer Lab
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
