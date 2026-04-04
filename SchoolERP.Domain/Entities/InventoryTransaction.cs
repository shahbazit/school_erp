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
    public decimal UnitPrice { get; set; }   // Rate at transaction time
    public decimal TotalAmount { get; set; } // Quantity * UnitPrice

    public string? Reference { get; set; }  // Bill No, Issue Slip No, etc.
    public string? Entity { get; set; }     // Supplier Name or Student/Staff Name
    public string? HandledBy { get; set; }  // Admin, Lab Asst, etc.
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    // Vendor payment status (for purchase tracking within inventory only – NO link to school finance)
    public string? PaymentStatus { get; set; } // Unpaid, Partial, Paid
    public decimal AmountPaid { get; set; } = 0; // Amount paid so far to vendor

    // Link to supplier (optional, for purchase type)
    public Guid? SupplierId { get; set; }
    public InventorySupplier? Supplier { get; set; }
}
