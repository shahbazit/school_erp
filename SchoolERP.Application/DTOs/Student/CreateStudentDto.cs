using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Student;

public class CreateStudentDto
{
    public string? AdmissionNo { get; set; } // Can be auto-generated
    
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

    public string? ClassId { get; set; }
    public string? SectionId { get; set; }
    public string? RollNumber { get; set; }
    public string? DateOfBirth { get; set; }
    public DateTime AdmissionDate { get; set; } = DateTime.UtcNow;
    public string? AcademicYear { get; set; }
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
    
    public bool ConsentAccepted { get; set; }
    public List<AssignCourseDto> CourseIds { get; set; } = new();

    // Fee Related
    public List<StudentFeeSubscriptionRequestDto> FeeSubscriptions { get; set; } = new();
    public List<StudentFeeDiscountRequestDto> FeeDiscounts { get; set; } = new();
}

public class StudentFeeSubscriptionRequestDto
{
    public Guid FeeHeadId { get; set; }
    public decimal? CustomAmount { get; set; }
}

public class StudentFeeDiscountRequestDto
{
    public Guid FeeDiscountId { get; set; }
    public Guid? FeeHeadId { get; set; }
    public Guid AcademicYearId { get; set; }
    public string? Remarks { get; set; }
    public string? CalculationType { get; set; } // Custom override
    public decimal? Value { get; set; } // Custom override
    public string? Frequency { get; set; } // Custom override
}

public class AssignCourseDto
{
    public Guid CourseId { get; set; }
    public Guid? BatchId { get; set; }
}
