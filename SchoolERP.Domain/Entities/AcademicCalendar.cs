using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class AcademicCalendar : BaseEntity
{
    public DateTime Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CalendarEventType Category { get; set; } = CalendarEventType.PublicHoliday;
    public bool IsHolidayForStudents { get; set; } = true;
    public bool IsHolidayForStaff { get; set; } = true;
    public Guid AcademicYearId { get; set; }
    public bool IsAllClasses { get; set; } = true;
    public virtual ICollection<AcademicClass> TargetClasses { get; set; } = new List<AcademicClass>();

    public bool IsAllStaff { get; set; } = true;
    public virtual ICollection<Department> TargetDepartments { get; set; } = new List<Department>();

    public virtual AcademicYear? AcademicYear { get; set; }
}

public enum CalendarEventType
{
    PublicHoliday,
    WeeklyOff,
    RestrictedHoliday,
    AcademicEvent,
    ExaminationDay
}
