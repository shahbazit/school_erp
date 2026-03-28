using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.Infrastructure.Services;

public class FinanceReportService : IFinanceReportService
{
    private readonly ApplicationDbContext _context;

    public FinanceReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccountSummaryDto>> GetAccountSummariesAsync(Guid? academicYearId = null)
    {
        var accounts = await _context.FinancialAccounts
            .Include(a => a.OwnerEmployee)
            .ToListAsync();
        var summaries = new List<AccountSummaryDto>();

        foreach (var account in accounts)
        {
            var feeIncome = await _context.FeeTransactions
                .Where(t => t.FinancialAccountId == account.Id && (t.Type == "Payment" || t.Type == "Refund"))
                .Where(t => !academicYearId.HasValue || t.AcademicYearId == academicYearId.Value)
                .SumAsync(t => t.Type == "Payment" ? t.Amount : -t.Amount);

            var otherIncome = await _context.OtherIncomes
                .Where(t => t.FinancialAccountId == account.Id)
                .Where(t => t.Category != "[Internal Transfer]" && t.Category != "Internal Transfer")
                .Where(t => !academicYearId.HasValue || t.AcademicYearId == academicYearId.Value)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            var officeExpenses = await _context.OfficeExpenses
                .Where(t => t.FinancialAccountId == account.Id && t.Status == "Paid")
                .Where(t => t.Category != "[Internal Transfer]" && t.Category != "Internal Transfer")
                .Where(t => !academicYearId.HasValue || t.AcademicYearId == academicYearId.Value)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            var transferIn = await _context.OtherIncomes
                .Where(t => t.FinancialAccountId == account.Id && (t.Category == "[Internal Transfer]" || t.Category == "Internal Transfer"))
                .SumAsync(t => (decimal?)t.Amount) ?? 0;
            var transferOut = await _context.OfficeExpenses
                .Where(t => t.FinancialAccountId == account.Id && (t.Category == "[Internal Transfer]" || t.Category == "Internal Transfer"))
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            summaries.Add(new AccountSummaryDto
            {
                AccountId = account.Id,
                AccountName = account.Name,
                AccountType = account.AccountType,
                OwnerName = account.OwnerEmployee != null ? $"{account.OwnerEmployee.FirstName} {account.OwnerEmployee.LastName}" : "Main Counter",
                OwnerEmployeeId = account.OwnerEmployeeId,
                IsActive = account.IsActive,
                TotalIncome = feeIncome + otherIncome, // Excludes internal transfers
                TotalExpense = officeExpenses, // Excludes internal transfers
                InternalTransfersIn = transferIn,
                InternalTransfersOut = transferOut
            });
        }

        return summaries;
    }

    public async Task<List<TransactionDetailDto>> GetAccountLedgerAsync(Guid financialAccountId, DateTime? startDate, DateTime? endDate)
    {
        var ledger = new List<TransactionDetailDto>();

        // Fee Payments
        var feePayments = await _context.FeeTransactions
            .Where(t => t.FinancialAccountId == financialAccountId)
            .Select(t => new TransactionDetailDto
            {
                Date = t.TransactionDate,
                Description = "Fee: " + (t.Student != null ? t.Student.FirstName + " " + t.Student.LastName : "Student Fee"),
                Category = "Fees",
                Amount = t.Amount,
                Type = (t.Type == "Payment" ? "Income" : "Expense"), // Refunds are expenses
                ReferenceNumber = t.ReferenceNumber ?? ""
            }).ToListAsync();

        // Other Incomes
        var otherIncomes = await _context.OtherIncomes
            .Where(t => t.FinancialAccountId == financialAccountId)
            .Select(t => new TransactionDetailDto
            {
                Date = t.Date,
                Description = t.Description,
                Category = t.Category,
                Amount = t.Amount,
                Type = "Income",
                ReferenceNumber = t.ReferenceNumber ?? ""
            }).ToListAsync();

        // Office Expenses
        var expenses = await _context.OfficeExpenses
            .Where(t => t.FinancialAccountId == financialAccountId && t.Status == "Paid")
            .Select(t => new TransactionDetailDto
            {
                Date = t.Date,
                Description = t.Description,
                Category = t.Category,
                Amount = t.Amount,
                Type = "Expense",
                ReferenceNumber = t.ReferenceNumber ?? ""
            }).ToListAsync();

        ledger.AddRange(feePayments);
        ledger.AddRange(otherIncomes);
        ledger.AddRange(expenses);

        return ledger.OrderByDescending(l => l.Date).ToList();
    }

    public async Task TransferFundsAsync(TransferFundsRequest request)
    {
        if (request.Amount <= 0) throw new Exception("Amount must be positive.");
        if (request.FromAccountId == request.ToAccountId) throw new Exception("Cannot transfer to the same account.");

        var fromAccount = await _context.FinancialAccounts.FindAsync(request.FromAccountId);
        var toAccount = await _context.FinancialAccounts.FindAsync(request.ToAccountId);

        if (fromAccount == null || toAccount == null) throw new Exception("One or both accounts not found.");

        // 1. Withdrawal from SOURCE account (as an office expense)
        var debit = new OfficeExpense
        {
            FinancialAccountId = request.FromAccountId,
            Amount = request.Amount,
            Date = DateTime.UtcNow,
            Category = "[Internal Transfer]",
            Description = $"TO: {toAccount.Name}. {request.Remarks}".Trim(),
            Status = "Paid",
            AcademicYearId = request.AcademicYearId,
            OrganizationId = fromAccount.OrganizationId
        };
        _context.OfficeExpenses.Add(debit);

        // 2. Deposit into DESTINATION account (as other income)
        var credit = new OtherIncome
        {
            FinancialAccountId = request.ToAccountId,
            Amount = request.Amount,
            Date = DateTime.UtcNow,
            Category = "[Internal Transfer]",
            Description = $"FROM: {fromAccount.Name}. {request.Remarks}".Trim(),
            AcademicYearId = request.AcademicYearId,
            OrganizationId = toAccount.OrganizationId
        };
        _context.OtherIncomes.Add(credit);

        await _context.SaveChangesAsync();
    }
}
