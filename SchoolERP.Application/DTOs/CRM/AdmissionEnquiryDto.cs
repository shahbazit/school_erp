using System;

namespace SchoolERP.Application.DTOs.CRM;

public class AdmissionEnquiryDto
{
    public Guid Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Guid ClassId { get; set; }
    public string? ClassName { get; set; }
    public string? Gender { get; set; }
    public string? Source { get; set; }
    public string Status { get; set; } = "New";
    public DateTime? NextFollowUpDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAdmissionEnquiryDto
{
    public string StudentName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Guid ClassId { get; set; }
    public string? Gender { get; set; }
    public string? Source { get; set; }
    public string Status { get; set; } = "New";
    public DateTime? NextFollowUpDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAdmissionEnquiryDto : CreateAdmissionEnquiryDto { }
