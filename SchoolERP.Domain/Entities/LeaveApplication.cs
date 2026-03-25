using SchoolERP.Domain.Common;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Domain.Entities;

public class LeaveApplication : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public Guid? ApprovedById { get; set; }
    public DateTime? ActionDate { get; set; }
    public string? ActionRemarks { get; set; }

    // Navigation
    public virtual Employee? Employee { get; set; }
    public virtual LeaveType? LeaveType { get; set; }
}
