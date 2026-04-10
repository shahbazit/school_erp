using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class FeeDiscount : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., Sibling Discount, Staff Child, Covid Relief
    public string? Description { get; set; }
    
    public string Category { get; set; } = "Other"; // Sibling, Staff, Merit, FinancialAid
    
    public string CalculationType { get; set; } = "Fixed"; // Fixed, Percentage
    public decimal Value { get; set; } // Amount or %
    
    public string Frequency { get; set; } = "Monthly"; // Monthly, OneTime (Annual)
    
    public Guid? DefaultFeeHeadId { get; set; }
    public FeeHead? DefaultFeeHead { get; set; }

    public bool IsActive { get; set; } = true;
}
