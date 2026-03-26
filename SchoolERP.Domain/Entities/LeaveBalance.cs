using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LeaveBalance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid LeaveTypeId { get; set; }
    public Guid AcademicYearId { get; set; }
    public decimal InitialBalance { get; set; } // Carried forward from previous year
    public decimal TotalDays { get; set; } // Quota for the current year
    public decimal ConsumedDays { get; set; }
    public decimal RemainingDays => (InitialBalance + TotalDays) - ConsumedDays;

    // Navigation
    public virtual Employee? Employee { get; set; }
    public virtual LeaveType? LeaveType { get; set; }
    public virtual AcademicYear? AcademicYear { get; set; }
}
