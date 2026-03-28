using SchoolERP.Domain.Entities;

namespace SchoolERP.Application.DTOs.Calendar;

public class AcademicCalendarDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CalendarEventType Category { get; set; }
    public bool IsHolidayForStudents { get; set; }
    public bool IsHolidayForStaff { get; set; }
    public Guid AcademicYearId { get; set; }
    public bool IsAllClasses { get; set; } = true;
    public List<Guid> TargetClassIds { get; set; } = new();
    public List<string> TargetClassNames { get; set; } = new();
    public bool IsAllStaff { get; set; } = true;
    public List<Guid> TargetDepartmentIds { get; set; } = new();
    public List<string> TargetDepartmentNames { get; set; } = new();
}

public class UpsertCalendarEventDto
{
    public Guid? Id { get; set; }
    public DateTime Date { get; set; }
    public DateTime? EndDate { get; set; } // For range support
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CalendarEventType Category { get; set; }
    public bool IsHolidayForStudents { get; set; }
    public bool IsHolidayForStaff { get; set; }
    public Guid AcademicYearId { get; set; }
    public bool IsAllClasses { get; set; } = true;
    public List<Guid> TargetClassIds { get; set; } = new();
    public bool IsAllStaff { get; set; } = true;
    public List<Guid> TargetDepartmentIds { get; set; } = new();
}

public class WeeklyOffSetupDto
{
    public List<DayOfWeek> DaysToOff { get; set; } = new();
    public List<int> SaturdaysToOff { get; set; } = new(); // e.g. [2, 4] for 2nd and 4th Saturday
    public Guid AcademicYearId { get; set; }
    public bool IsHolidayForStudents { get; set; } = true;
    public bool IsHolidayForStaff { get; set; } = true;
}

public class CalendarSettingsDto
{
    public List<DayOfWeek> WeeklyOffDays { get; set; } = new();
    public List<int> SaturdayOffOccurrences { get; set; } = new();
}
