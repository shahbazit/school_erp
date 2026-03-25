using System.Collections.Generic;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Domain.Entities;

public class PayrollRun : BaseEntity
{
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime ProcessedDate { get; set; } = DateTime.UtcNow;
    public Guid? ProcessedById { get; set; }
    public PayrollStatus Status { get; set; } = PayrollStatus.Draft;
    public decimal TotalAmount { get; set; }
    public string? Remarks { get; set; }
    
    // Navigation
    public virtual ICollection<PayrollDetail> PayrollDetails { get; set; } = new List<PayrollDetail>();
    public virtual User? ProcessedBy { get; set; }
}
