using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class OfficeExpense : BaseEntity
{
    public string Category { get; set; } = string.Empty; // Utility, Maintenance, Supplies, Marketing, Salary, Rent, etc.
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Paid"; // Paid, Pending
    public string? ReferenceNumber { get; set; } // Bill No, Receipt No
    public string? PaymentMethod { get; set; } // Cash, Bank, UPI
    public Guid? AcademicYearId { get; set; } // Financial/Academic Year link
    public Guid? LinkedEmployeeId { get; set; } // For staff-specific misc payouts (Bonus, Incentive, etc.)
    public Guid? FinancialAccountId { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.ForeignKey("FinancialAccountId")]
    public virtual FinancialAccount? FinancialAccount { get; set; }
}
