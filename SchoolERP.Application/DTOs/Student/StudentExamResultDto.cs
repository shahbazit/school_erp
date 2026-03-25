namespace SchoolERP.Application.DTOs.Student;

public class StudentExamResultDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string AdmissionNo { get; set; } = string.Empty;
    
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;

    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
    public decimal ObtainedMarks { get; set; }

    public string? Grade { get; set; }
    public string? Remarks { get; set; }
}

public class MarkEntryRequestDto
{
    public Guid ExamId { get; set; }
    public Guid ClassId { get; set; }
    public Guid SectionId { get; set; }
    public Guid SubjectId { get; set; }
    public decimal TargetTotalMarks { get; set; } = 100;
    public decimal TargetPassingMarks { get; set; } = 33;
    public List<StudentExamResultDto> Records { get; set; } = new();
}
