using SchoolERP.Domain.Common;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Domain.Entities;

/// <summary>
/// Daily attendance record for an employee.
/// Designed for bulk entry or individual marking.
/// </summary>
public class EmployeeAttendance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    
    // The specific date this attendance record refers to (time component should be 00:00:00 UTC)
    public DateTime AttendanceDate { get; set; }
    
    // Status for the day
    public AttendanceStatus Status { get; set; }
    
    // Optional precise times
    public TimeSpan? InTime { get; set; }
    public TimeSpan? OutTime { get; set; }
    
    // Optional notes from HR or the employee
    public string? Remarks { get; set; }

    // Navigation
    public virtual Employee? Employee { get; set; }
}
