using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LeaveType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }
    public bool IsActive { get; set; } = true;
}
