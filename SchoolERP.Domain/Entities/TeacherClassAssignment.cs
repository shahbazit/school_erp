using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

/// <summary>
/// Assigns a teacher to a specific class-section for an academic year.
/// IsClassTeacher marks this teacher as the class teacher of that section
/// (enforced at app level: only one active class teacher per class+section+year).
/// </summary>
public class TeacherClassAssignment : BaseEntity
{
    public Guid TeacherProfileId { get; set; }
    public Guid ClassId { get; set; }
    public Guid SectionId { get; set; }
    public Guid AcademicYearId { get; set; }
    public bool IsClassTeacher { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual TeacherProfile? TeacherProfile { get; set; }
    public virtual AcademicClass? Class { get; set; }
    public virtual AcademicSection? Section { get; set; }
    public virtual AcademicYear? AcademicYear { get; set; }
}
