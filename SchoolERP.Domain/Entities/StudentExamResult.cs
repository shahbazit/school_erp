using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentExamResult : BaseEntity
{
    public Guid ExamId { get; set; }
    public Guid StudentId { get; set; }
    public Guid SubjectId { get; set; }
    
    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
    public decimal ObtainedMarks { get; set; }
    
    public string? Grade { get; set; }
    public string? Remarks { get; set; } // Pass, Fail, etc.

    public virtual Exam Exam { get; set; } = null!;
    public virtual Student Student { get; set; } = null!;
    public virtual Subject Subject { get; set; } = null!;
}
