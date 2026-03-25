using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentFeeAccount : BaseEntity
{
    public Guid StudentId { get; set; }
    public virtual Student Student { get; set; } = null!;

    public decimal TotalAllocated { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal CurrentBalance => TotalAllocated - TotalPaid - TotalDiscount;

    public DateTime LastTransactionDate { get; set; }
}
