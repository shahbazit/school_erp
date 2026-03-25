using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

/// <summary>
/// Assigns a subject to a teacher for a given academic year.
/// A teacher can teach multiple subjects; a subject can be assigned to multiple teachers.
/// </summary>
public class TeacherSubjectAssignment : BaseEntity
{
    public Guid TeacherProfileId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid AcademicYearId { get; set; }
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual TeacherProfile? TeacherProfile { get; set; }
    public virtual Subject? Subject { get; set; }
    public virtual AcademicYear? AcademicYear { get; set; }
}
