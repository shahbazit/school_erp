using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class EmployeeRole : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Teacher, Admin, Accountant, Staff
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
