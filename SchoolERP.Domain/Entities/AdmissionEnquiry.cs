using SchoolERP.Domain.Common;
using System;

namespace SchoolERP.Domain.Entities;

public class AdmissionEnquiry : BaseEntity
{
    public string StudentName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Guid ClassId { get; set; }
    public string? Gender { get; set; } // Male, Female, Other
    public string? Source { get; set; } // Website, Referral, Social Media, etc.
    public string Status { get; set; } = "New"; // New, Follow-up, Converted, Lost
    public DateTime? NextFollowUpDate { get; set; }
    public string? Notes { get; set; }

    // Navigation Property
    public virtual AcademicClass? Class { get; set; }
}
