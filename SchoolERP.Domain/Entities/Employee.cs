using SchoolERP.Domain.Common;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Domain.Entities;

public class Employee : BaseEntity
{
    // 1. Basic / Personal Information
    public string EmployeeCode { get; set; } = string.Empty;   // Auto-generated e.g. EMP20260001
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? Nationality { get; set; }
    public string? Religion { get; set; }
    public string? MaritalStatus { get; set; }
    public string? ProfilePhoto { get; set; }

    // 2. Contact Information
    public string MobileNumber { get; set; } = string.Empty;
    public string WorkEmail { get; set; } = string.Empty;
    public string? PersonalEmail { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactNumber { get; set; }

    // Present Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }

    // Permanent Address
    public string? PermanentAddressLine1 { get; set; }
    public string? PermanentAddressLine2 { get; set; }
    public string? PermanentCity { get; set; }
    public string? PermanentState { get; set; }
    public string? PermanentPincode { get; set; }

    // 3. Job Information
    public Guid? DepartmentId { get; set; }
    public Guid? DesignationId { get; set; }
    public Guid? EmployeeRoleId { get; set; }   // FK → EmployeeRole master
    public Guid? LeavePlanId { get; set; }     // FK → LeavePlan
    public DateTime DateOfJoining { get; set; }
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public string? WorkLocation { get; set; }

    // 4. Status
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public bool IsActive { get; set; } = true;
    public bool IsLoginEnabled { get; set; } = true;
    public string? DeactivationReason { get; set; }

    // 5. Optional Login Linkage
    public Guid? UserId { get; set; }           // FK → User (optional)

    // Navigation
    public virtual Department? Department { get; set; }
    public virtual Designation? Designation { get; set; }
    public virtual LeavePlan? LeavePlan { get; set; }
    public virtual EmployeeRole? EmployeeRole { get; set; }
    public virtual ICollection<EmployeeDocument> Documents { get; set; } = new List<EmployeeDocument>();

    // Teacher-specific profile (null when employee is not a teacher)
    public virtual TeacherProfile? TeacherProfile { get; set; }
}
