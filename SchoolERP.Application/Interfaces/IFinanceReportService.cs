namespace SchoolERP.Application.Interfaces;

public interface IFinanceReportService
{
    Task<List<AccountSummaryDto>> GetAccountSummariesAsync(Guid? academicYearId = null);
    Task<List<TransactionDetailDto>> GetAccountLedgerAsync(Guid financialAccountId, DateTime? startDate, DateTime? endDate);
    Task TransferFundsAsync(TransferFundsRequest request);
}

public class TransferFundsRequest
{
    public Guid FromAccountId { get; set; }
    public Guid ToAccountId { get; set; }
    public decimal Amount { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public Guid? AcademicYearId { get; set; }
}

public class AccountSummaryDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public Guid? OwnerEmployeeId { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal TotalIncome { get; set; } // Actual School Revenue
    public decimal TotalExpense { get; set; } // Actual School Expense
    public decimal InternalTransfersIn { get; set; }
    public decimal InternalTransfersOut { get; set; }
    public decimal ClosingBalance => (TotalIncome + InternalTransfersIn) - (TotalExpense + InternalTransfersOut);
}

public class TransactionDetailDto
{
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty; // In / Out
    public string ReferenceNumber { get; set; } = string.Empty;
}
