using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LeaveBalance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid LeaveTypeId { get; set; }
    public Guid AcademicYearId { get; set; }
    public decimal TotalDays { get; set; }
    public decimal ConsumedDays { get; set; }
    public decimal RemainingDays => TotalDays - ConsumedDays;

    // Navigation
    public virtual Employee? Employee { get; set; }
    public virtual LeaveType? LeaveType { get; set; }
    public virtual AcademicYear? AcademicYear { get; set; }
}
