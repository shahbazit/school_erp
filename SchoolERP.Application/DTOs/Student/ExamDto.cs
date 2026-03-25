namespace SchoolERP.Application.DTOs.Student;

public class ExamDto
{
    public Guid Id { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Scheduled";
}

public class CreateExamDto
{
    public string ExamName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Scheduled";
}
