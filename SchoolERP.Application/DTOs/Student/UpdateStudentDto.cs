using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Student;

public class UpdateStudentDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    public string Gender { get; set; } = string.Empty;
    public string? BloodGroup { get; set; }
    public string? StudentPhoto { get; set; }

    [Required]
    public string MobileNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
 
    [Required]
    public string ClassId { get; set; } = string.Empty;
    public string? SectionId { get; set; }
    public string? RollNumber { get; set; }
    public string? DateOfBirth { get; set; }

    [Required]
    public string AcademicYear { get; set; } = string.Empty;
    public string? PreviousSchool { get; set; }

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

    public bool IsActive { get; set; } = true;
    public List<AssignCourseDto> CourseIds { get; set; } = new();

    // Fee Related
    public List<StudentFeeSubscriptionRequestDto> FeeSubscriptions { get; set; } = new();
    public List<StudentFeeDiscountRequestDto> FeeDiscounts { get; set; } = new();
}
