using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Student : BaseEntity
{
    // 1. Basic Information
    public string AdmissionNo { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? StudentPhoto { get; set; }

    // 2. Contact Information
    public string MobileNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }

    // 3. Academic Information
    public DateTime AdmissionDate { get; set; }
    public string? PreviousSchool { get; set; }

    // 5. Guardian / Parent Management
    public string? FatherName { get; set; }
    public string? FatherMobile { get; set; }
    public string? FatherEmail { get; set; }
    public string? FatherOccupation { get; set; }

    public string? MotherName { get; set; }
    public string? MotherMobile { get; set; }
    public string? MotherEmail { get; set; }
    public string? MotherOccupation { get; set; }

    public string? GuardianName { get; set; }
    public string? GuardianMobile { get; set; }
    public string? GuardianEmail { get; set; }
    public string? GuardianRelation { get; set; }

    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactNumber { get; set; }
    public string? EmergencyContactRelation { get; set; }

    // 6. System Fields (Tenant/Created fields inherited from BaseEntity)
    public bool IsActive { get; set; } = true;

    // 7. Security / Compliance Fields
    public bool IsMobileVerified { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool ConsentAccepted { get; set; }
    
    public string MaskedMobile => string.IsNullOrEmpty(MobileNumber) ? "" : $"******{MobileNumber.Substring(Math.Max(0, MobileNumber.Length - 4))}";
    public string MaskedEmail => string.IsNullOrEmpty(Email) ? "" : $"{Email.Substring(0, Math.Min(2, Email.Length))}***@{Email.Split('@').LastOrDefault()}";

    // Parallel Course
    public virtual ICollection<StudentCourse> EnrolledCourses { get; set; } = new List<StudentCourse>();

    public virtual ICollection<StudentAcademic> AcademicRecords { get; set; } = new List<StudentAcademic>();
    public virtual ICollection<StudentDocument> Documents { get; set; } = new List<StudentDocument>();
    public virtual ICollection<StudentAttendance> Attendances { get; set; } = new List<StudentAttendance>();
    public virtual ICollection<StudentExamResult> ExamResults { get; set; } = new List<StudentExamResult>();
}
