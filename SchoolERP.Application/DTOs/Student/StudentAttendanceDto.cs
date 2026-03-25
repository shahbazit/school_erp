namespace SchoolERP.Application.DTOs.Student;

public class StudentAttendanceDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string AdmissionNo { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Present";
    public string? Remarks { get; set; }
}

public class MarkStudentAttendanceRequest
{
    public Guid ClassId { get; set; }
    public Guid SectionId { get; set; }
    public DateTime AttendanceDate { get; set; }
    public List<StudentAttendanceDto> Records { get; set; } = new();
}

public class MonthlyStudentAttendanceSummaryDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string AdmissionNo { get; set; } = string.Empty;
    public int TotalPresent { get; set; }
    public int TotalAbsent { get; set; }
    public int TotalHalfDay { get; set; }
    public int TotalLeave { get; set; }
    public List<DailyStudentAttendanceDto> DailyRecords { get; set; } = new();
}

public class DailyStudentAttendanceDto
{
    public DateTime AttendanceDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
