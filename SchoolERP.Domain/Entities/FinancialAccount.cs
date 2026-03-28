using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class FinancialAccount : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string AccountType { get; set; } = "Cash"; // Cash, Bank, Online
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Optional: link to an employee if this account is "owned" by a specific person
    public Guid? OwnerEmployeeId { get; set; }
    public virtual Employee? OwnerEmployee { get; set; }
}
