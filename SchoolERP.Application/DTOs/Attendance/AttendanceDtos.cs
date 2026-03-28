using System.ComponentModel.DataAnnotations;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Attendance;

// ── Shared / Output DTOs ───────────────────────────────────────────────────

public class EmployeeAttendanceDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? DesignationName { get; set; }
    public string? ProfilePhoto { get; set; }
    public DateTime AttendanceDate { get; set; }
    public AttendanceStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public TimeSpan? InTime { get; set; }
    public TimeSpan? OutTime { get; set; }
    public string? Remarks { get; set; }
}

public class MonthlyAttendanceSummaryDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalPresent { get; set; }
    public int TotalAbsent { get; set; }
    public int TotalHalfDay { get; set; }
    public int TotalLate { get; set; }
    public int TotalOnLeave { get; set; }
    public int TotalWorkingDays { get; set; }
    public List<EmployeeAttendanceDto> DailyRecords { get; set; } = new();
}

// ── Input DTOs ─────────────────────────────────────────────────────────────

public class MarkAttendanceDto
{
    [Required] public Guid EmployeeId { get; set; }
    [Required] public DateTime AttendanceDate { get; set; } // Time should be 00:00:00 natively
    [Required] public AttendanceStatus Status { get; set; }
    public TimeSpan? InTime { get; set; }
    public TimeSpan? OutTime { get; set; }
    public string? Remarks { get; set; }
}

public class BulkMarkAttendanceDto
{
    [Required] public List<MarkAttendanceDto> Records { get; set; } = new();
}

public class DetailedMonthlyAttendanceDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public List<AttendanceDayDetailDto> Days { get; set; } = new();
}

public class AttendanceDayDetailDto
{
    public DateTime Date { get; set; }
    public string DayType { get; set; } = "WorkingDay"; // WorkingDay, Holiday, WeeklyOff
    public string? EventName { get; set; }
    public AttendanceStatus? AttendanceStatus { get; set; }
    public string? LeaveType { get; set; }
    public bool IsMissing { get; set; }
}
