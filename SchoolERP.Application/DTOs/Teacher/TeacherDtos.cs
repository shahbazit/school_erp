using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Teacher;

// ── TeacherProfile DTOs ───────────────────────────────────────────────────

public class UpsertTeacherProfileDto
{
    [Required] public Guid EmployeeId { get; set; }
    public string? HighestQualification { get; set; }
    public string? QualificationInstitution { get; set; }
    public int? QualificationYear { get; set; }
    public string? Specializations { get; set; }
    public int? PreviousExperienceYears { get; set; }
    public string? PreviousSchools { get; set; }
}

public class TeacherProfileDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? ProfilePhoto { get; set; }
    public string? WorkEmail { get; set; }
    public string? MobileNumber { get; set; }
    public string? DepartmentName { get; set; }
    public string? DesignationName { get; set; }
    public bool IsActive { get; set; }

    // Teacher-specific
    public string? HighestQualification { get; set; }
    public string? QualificationInstitution { get; set; }
    public int? QualificationYear { get; set; }
    public string? Specializations { get; set; }
    public int? PreviousExperienceYears { get; set; }
    public string? PreviousSchools { get; set; }

    // Computed: years since joining used as current-school experience
    public int? CurrentSchoolExperienceYears { get; set; }
    public int? TotalExperienceYears { get; set; }

    public List<TeacherSubjectAssignmentDto> SubjectAssignments { get; set; } = new();
    public List<TeacherClassAssignmentDto> ClassAssignments { get; set; } = new();
}

// ── Subject Assignment DTOs ───────────────────────────────────────────────

public class AssignSubjectDto
{
    [Required] public Guid SubjectId { get; set; }
    [Required] public Guid AcademicYearId { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

public class TeacherSubjectAssignmentDto
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public Guid AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; }
}

// ── Class Assignment DTOs ─────────────────────────────────────────────────

public class AssignClassDto
{
    [Required] public Guid ClassId { get; set; }
    [Required] public Guid SectionId { get; set; }
    [Required] public Guid AcademicYearId { get; set; }
    public bool IsClassTeacher { get; set; } = false;
}

public class TeacherClassAssignmentDto
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public Guid SectionId { get; set; }
    public string SectionName { get; set; } = string.Empty;
    public Guid AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public bool IsClassTeacher { get; set; }
    public bool IsActive { get; set; }
}
