using SchoolERP.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolERP.Domain.Entities;

public class FeeDiscountAssignment : BaseEntity
{
    public Guid StudentId { get; set; }
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
    
    public Guid FeeDiscountId { get; set; }
    [ForeignKey("FeeDiscountId")]
    public virtual FeeDiscount Discount { get; set; } = null!;
    
    public Guid AcademicYearId { get; set; }
    [ForeignKey("AcademicYearId")]
    public virtual AcademicYear AcademicYear { get; set; } = null!;
    
    public Guid? RestrictedFeeHeadId { get; set; }
    [ForeignKey("RestrictedFeeHeadId")]
    public virtual FeeHead? RestrictedFeeHead { get; set; }
    
    public string Remarks { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Overrides
    public string? CustomCalculationType { get; set; } // Fixed, Percentage
    public decimal? CustomValue { get; set; } // Amount or %
    public string? CustomFrequency { get; set; } // Monthly, OneTime, Yearly
}
