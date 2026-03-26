using SchoolERP.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Employee;

public class CreateEmployeeDto
{
    // Personal
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? Nationality { get; set; }
    public string? Religion { get; set; }
    public string? MaritalStatus { get; set; }
    public string? ProfilePhoto { get; set; }

    // Contact
    [Required] public string MobileNumber { get; set; } = string.Empty;
    [Required, EmailAddress] public string WorkEmail { get; set; } = string.Empty;
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
    public Guid? DesignationId { get; set; }
    public Guid? EmployeeRoleId { get; set; }
    [Required] public DateTime DateOfJoining { get; set; }
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public string? WorkLocation { get; set; }

    // System Account
    public bool CreateSystemUser { get; set; }
    public string? SystemPassword { get; set; }

    // Optional login
    public Guid? UserId { get; set; }
}
