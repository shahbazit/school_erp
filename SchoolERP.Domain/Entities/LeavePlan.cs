using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LeavePlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; }

    // Navigation
    public virtual ICollection<LeaveType> LeaveTypes { get; set; } = new List<LeaveType>();
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
