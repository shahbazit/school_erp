namespace SchoolERP.Application.DTOs.Fees;

public class FeeTransactionDto
{
    public Guid Id { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? PaymentMethod { get; set; }
}

public class StudentFeeAccountDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public decimal TotalAllocated { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal CurrentBalance { get; set; }
    public DateTime LastTransactionDate { get; set; }
    public List<FeeTransactionDto> Transactions { get; set; } = new();
}

public class ProcessPaymentRequest
{
    public Guid StudentId { get; set; }
    public decimal Amount { get; set; }
    public decimal Discount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Remarks { get; set; }
}
