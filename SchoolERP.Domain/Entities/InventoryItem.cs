namespace SchoolERP.Domain.Entities;
using System.Collections.Generic;
using SchoolERP.Domain.Common;

public class InventoryItem : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public Guid CategoryId { get; set; }
    public InventoryCategory? Category { get; set; }
    public string Unit { get; set; } = "Pcs"; // Pcs, Set, Pad, etc.
    public decimal MinQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal CurrentStock { get; set; }
    
    // Links for convenience
    public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
}
