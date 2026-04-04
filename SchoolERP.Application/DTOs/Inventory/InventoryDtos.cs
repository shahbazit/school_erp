namespace SchoolERP.Application.DTOs.Inventory;
using SchoolERP.Domain.Entities;

public class InventoryCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}

public class InventoryItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Unit { get; set; } = null!;
    public decimal MinQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal CurrentStock { get; set; }
}

public class InventorySupplierDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Category { get; set; }
}

public class InventoryTransactionDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string? ItemName { get; set; }
    public InventoryTransactionType Type { get; set; }
    public string TypeName => Type.ToString();
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Reference { get; set; }
    public string? Entity { get; set; }
    public string? HandledBy { get; set; }
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; }

    // Vendor payment info (internal to inventory, NOT linked to school finance)
    public Guid? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public string? PaymentStatus { get; set; }  // Unpaid | Partial | Paid
    public decimal AmountPaid { get; set; }
    public decimal AmountDue => TotalAmount - AmountPaid;
}

public class UpsertInventoryItemRequest
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public Guid CategoryId { get; set; }
    public string Unit { get; set; } = "Pcs";
    public decimal MinQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class CreateInventoryTransactionRequest
{
    public Guid ItemId { get; set; }
    public InventoryTransactionType Type { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Reference { get; set; }
    public string? Entity { get; set; }
    public string? HandledBy { get; set; }
    public string? Notes { get; set; }

    // For purchase type only – supplier & payment info (no school finance link)
    public Guid? SupplierId { get; set; }
    public string? PaymentStatus { get; set; } // Unpaid | Partial | Paid
    public decimal AmountPaid { get; set; } = 0;
}

public class UpdatePaymentStatusRequest
{
    public string PaymentStatus { get; set; } = "Paid"; // Unpaid | Partial | Paid
    public decimal AmountPaid { get; set; }
}
