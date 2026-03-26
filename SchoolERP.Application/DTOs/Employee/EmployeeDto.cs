using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Employee;

public class EmployeeDto
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;

    // Personal
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? Nationality { get; set; }
    public string? Religion { get; set; }
    public string? MaritalStatus { get; set; }
    public string? ProfilePhoto { get; set; }

    // Contact
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

    // Job
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? DesignationId { get; set; }
    public string? DesignationName { get; set; }
    public Guid? EmployeeRoleId { get; set; }
    public string? EmployeeRoleName { get; set; }
    public DateTime DateOfJoining { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public string EmploymentTypeName => EmploymentType.ToString();
    public string? WorkLocation { get; set; }

    // Status
    public bool IsActive { get; set; }
    public EmployeeStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? DeactivationReason { get; set; }

    // Teacher Profile
    public bool HasTeacherProfile { get; set; }
    public bool CreateSystemUser { get; set; }

    // Login
    public Guid? UserId { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Documents
    public List<EmployeeDocumentDto> Documents { get; set; } = new();
}
