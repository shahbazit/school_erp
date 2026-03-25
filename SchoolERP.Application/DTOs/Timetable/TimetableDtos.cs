using System;
using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Timetable;

public class CreateTimetableDto
{
    [Required] public Guid AcademicYearId { get; set; }
    [Required] public Guid ClassId { get; set; }
    [Required] public Guid SectionId { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public List<TimetableDetailDto> Periods { get; set; } = new();
}

public class TimetableDto
{
    public Guid Id { get; set; }
    public Guid AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public Guid SectionId { get; set; }
    public string SectionName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<TimetableDetailDto> Periods { get; set; } = new();
}

public class TimetableDetailDto
{
    public Guid? Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public int PeriodNumber { get; set; }
    public string StartTime { get; set; } = string.Empty; // Format HH:mm
    public string EndTime { get; set; } = string.Empty;   // Format HH:mm
    public Guid? SubjectId { get; set; }
    public string? SubjectName { get; set; }
    public string? SubjectCode { get; set; }
    public Guid? TeacherId { get; set; }
    public string? TeacherName { get; set; }
    public string? TeacherCode { get; set; }
    public bool IsBreak { get; set; }
    public string? Remarks { get; set; }
}
