using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class FeeStructure : BaseEntity
{
    public Guid FeeHeadId { get; set; }
    public virtual FeeHead FeeHead { get; set; } = null!;
    
    public Guid ClassId { get; set; }
    public virtual AcademicClass Class { get; set; } = null!;
    
    public Guid AcademicYearId { get; set; }
    public virtual AcademicYear AcademicYear { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = "Monthly"; // Monthly, Quarterly, Yearly, One-time
    public string? ApplicableMonth { get; set; } // e.g., "April" - mandatory for Yearly/One-time
    public string? Description { get; set; }
}
