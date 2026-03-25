using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Exam : BaseEntity
{
    public string ExamName { get; set; } = string.Empty; // Mid-Term, Final, Unit Test
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Ongoing, Completed, Cancelled
    
    public virtual ICollection<StudentExamResult> ExamResults { get; set; } = new List<StudentExamResult>();
}
