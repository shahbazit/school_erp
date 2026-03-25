using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class FeeTransaction : BaseEntity
{
    public Guid StudentId { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;

    public DateTime TransactionDate { get; set; }
    public string Type { get; set; } = string.Empty; // Charge, Payment, Discount, Refund
    public decimal Amount { get; set; }
    public Guid AcademicYearId { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.ForeignKey("AcademicYearId")]
    public virtual AcademicYear? AcademicYear { get; set; }

    public string? Description { get; set; }
    public string? ReferenceNumber { get; set; } // Receipt No, Bank Ref, etc.
    public string? PaymentMethod { get; set; } // Cash, Bank, Online
}
