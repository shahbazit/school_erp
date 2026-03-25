using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentAcademic : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid ClassId { get; set; }
    public Guid? SectionId { get; set; }
    public string AcademicYear { get; set; } = string.Empty;
    public string? RollNumber { get; set; }
    public string Status { get; set; } = "Active"; // Active, Promoted, Detained, Completed, Left
    public bool IsCurrent { get; set; } = true;

    public virtual Student Student { get; set; } = null!;
    public virtual AcademicClass Class { get; set; } = null!;
    public virtual AcademicSection? Section { get; set; }
}
