using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class SubjectBook : BaseEntity
{
    public Guid AcademicClassId { get; set; }
    public Guid SubjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual AcademicClass? AcademicClass { get; set; }
    public virtual Subject? Subject { get; set; }
    public virtual ICollection<SubjectChapter> Chapters { get; set; } = new List<SubjectChapter>();
}
