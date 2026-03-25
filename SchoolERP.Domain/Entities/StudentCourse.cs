using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentCourse : BaseEntity
{
    public Guid StudentId { get; set; }
    public virtual Student Student { get; set; } = null!;

    public Guid CourseId { get; set; }
    public virtual Course Course { get; set; } = null!;

    public Guid? BatchId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Completed, Cancelled
}
