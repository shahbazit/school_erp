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
    public string? Status { get; set; }
    public bool IsMobileVerified { get; set; }
    public bool IsEmailVerified { get; set; }
    
    public string? LedgerNumber { get; set; }
    public string? SRNNumber { get; set; }
    public string? PermanentEducationNo { get; set; }
    public string? FamilyId { get; set; }
    public string? ApaarId { get; set; }
    public string? Medium { get; set; }
    public string? EnrollmentSchoolName { get; set; }
    public decimal? OpeningBalance { get; set; }
    public string? AdmissionScheme { get; set; }
    public string? AdmissionType { get; set; }
    public string? Religion { get; set; }
    public string? Category { get; set; }
    public string? Caste { get; set; }
    public string? PlaceOfBirth { get; set; }
    public decimal? HeightInCM { get; set; }
    public decimal? WeightInKG { get; set; }
    public string? ColorVision { get; set; }
    public string? PreviousClass { get; set; }
    public string? TCNo { get; set; }
    public DateTime? TCDate { get; set; }
    public string? HouseName { get; set; }
    public bool IsCaptain { get; set; }
    public bool IsMonitor { get; set; }
    public string? Bus { get; set; }
    public string? RouteName { get; set; }
    public string? StoppageName { get; set; }
    public decimal? BusFee { get; set; }
    public string? StudentAadharNo { get; set; }
    public string? StudentBankAccountNo { get; set; }
    public string? StudentBankName { get; set; }
    public string? StudentIFSCCODE { get; set; }
    public string? FatherAadharNo { get; set; }
    public string? ParentAccountNo { get; set; }
    public string? ParentBankName { get; set; }
    public string? ParentBankIFSCCODE { get; set; }
    public string? MotherAadharNo { get; set; }
    public string? RegistrationNumber { get; set; }
    public decimal? AnnualIncome { get; set; }
    public string? FatherQualification { get; set; }
    public string? MotherQualification { get; set; }
    public string? ParentMobileNumber { get; set; }
    public string? ParentEmail { get; set; }
    public string? ParentOccupation { get; set; }
    public string? ParentQualification { get; set; }
    public bool SMSFacility { get; set; }
    public string? SMSMobileNumber { get; set; }
    public string? PrimaryContact { get; set; }
    public string? PermanentAddress { get; set; }

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
    public string? Category { get; set; }
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
