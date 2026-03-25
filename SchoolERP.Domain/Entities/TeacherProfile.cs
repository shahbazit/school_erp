using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

/// <summary>
/// Extended teacher-specific profile. One-to-one with Employee (only for employees with Teacher role).
/// </summary>
public class TeacherProfile : BaseEntity
{
    public Guid EmployeeId { get; set; }

    // Qualification
    public string? HighestQualification { get; set; }   // e.g. M.Sc Mathematics
    public string? QualificationInstitution { get; set; }
    public int? QualificationYear { get; set; }

    // Specialization (comma-separated or store as JSON; kept simple here)
    public string? Specializations { get; set; }         // e.g. "Mathematics, Physics"

    // Experience
    public int? PreviousExperienceYears { get; set; }    // Years at other schools
    public string? PreviousSchools { get; set; }          // Semi-colon separated previous schools

    // Navigation
    public virtual Employee? Employee { get; set; }
    public virtual ICollection<TeacherSubjectAssignment> SubjectAssignments { get; set; } = new List<TeacherSubjectAssignment>();
    public virtual ICollection<TeacherClassAssignment> ClassAssignments { get; set; } = new List<TeacherClassAssignment>();
}
