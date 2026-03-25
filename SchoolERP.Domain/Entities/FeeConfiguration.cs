using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class FeeConfiguration : BaseEntity
{
    // Common settings for Late Fees
    public int MonthlyDueDay { get; set; } = 10; // e.g., 10th of the month
    public int GracePeriodDays { get; set; } = 0; // Number of days after due date before late fee is applied
    
    public string LateFeeType { get; set; } = "Fixed"; // Fixed (one-time penalty), PerDay (daily accrual)
    public decimal LateFeeAmount { get; set; } // Penalty Amount
    
    public bool AutoCalculateLateFee { get; set; } = true;
    public bool IsActive { get; set; } = true;
    
    // Monthly / OneTime logic
    public string Frequency { get; set; } = "Monthly";
}
