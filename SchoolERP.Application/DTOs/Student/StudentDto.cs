using SchoolERP.Application.DTOs.Fees;
using System;

namespace SchoolERP.Application.DTOs.Student;

public class StudentDto
{
    public Guid Id { get; set; }
    public string AdmissionNo { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? StudentPhoto { get; set; }
    
    public string MobileNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }

    public Guid? ClassId { get; set; }
    public Guid? SectionId { get; set; }
    public string? RollNumber { get; set; }
    public DateTime AdmissionDate { get; set; }
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

    public bool IsActive { get; set; }
    public bool IsMobileVerified { get; set; }
    public bool IsEmailVerified { get; set; }
    
    public List<StudentCourseDto> EnrolledCourses { get; set; } = new();

    // Fee related info for the form
    public List<StudentFeeSubscriptionDto> FeeSubscriptions { get; set; } = new();
    public List<FeeDiscountAssignmentDto> FeeDiscounts { get; set; } = new();
}

public class FeeDiscountAssignmentDto
{
    public Guid Id { get; set; }
    public Guid FeeDiscountId { get; set; }
    public string DiscountName { get; set; } = string.Empty;
    public Guid? RestrictedFeeHeadId { get; set; }
    public string? RestrictedFeeHeadName { get; set; }
    public Guid AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string? CalculationType { get; set; }
    public decimal? Value { get; set; }
    public string? Frequency { get; set; }
}

public class StudentCourseDto
{
    public Guid CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public Guid? BatchId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
