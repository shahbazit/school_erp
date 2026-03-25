using System;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class TimetableDetail : BaseEntity
{
    public Guid TimetableId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public int PeriodNumber { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public Guid? SubjectId { get; set; }
    public Guid? TeacherId { get; set; } // EmployeeId
    public bool IsBreak { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Remarks { get; set; }

    public virtual Timetable? Timetable { get; set; }
    public virtual Subject? Subject { get; set; }
    public virtual Employee? Teacher { get; set; }
}
