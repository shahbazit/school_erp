namespace SchoolERP.Domain.Entities;
using SchoolERP.Domain.Common;

public enum InventoryTransactionType
{
    Purchase = 1,
    Issue = 2,
    Adjustment = 3,
    Return = 4
}

public class InventoryTransaction : BaseEntity
{
    public Guid ItemId { get; set; }
    public InventoryItem? Item { get; set; }
    public InventoryTransactionType Type { get; set; }
    public decimal Quantity { get; set; }
    public string? Reference { get; set; } // Bill No, Issue Slip No, etc. 
    public string? Entity { get; set; } // Supplier Name or Student/Staff Name
    public string? HandledBy { get; set; } // Admin, Lab Asst, etc.
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
}
