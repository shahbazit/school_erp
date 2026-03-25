using System;
using System.Collections.Generic;

namespace SchoolERP.Application.DTOs.Financials;

public class FinancialSummaryDto
{
    public decimal TotalRevenueYTD { get; set; }
    public decimal TotalExpensesYTD { get; set; }
    public decimal NetProfit => TotalRevenueYTD - TotalExpensesYTD;
    public decimal OverallCollectionRate { get; set; }
    public List<RevenueSourceDto> RevenueSources { get; set; } = new();
    public List<TransactionDto> RecentTransactions { get; set; } = new();
}

public class RevenueSourceDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public double Percentage { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class TransactionDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty; // Credit (Income), Debit (Expense)
    public string Method { get; set; } = string.Empty;
}

public class DefaulterDto
{
    public Guid StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string AdmissionNo { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public decimal OutstandingAmount { get; set; }
}

public class CreateExpenseDto
{
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "Paid";
    public string? ReferenceNumber { get; set; }
    public string? PaymentMethod { get; set; }
    public Guid? AcademicYearId { get; set; }
}

public class CreateOtherIncomeDto
{
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? PaymentMethod { get; set; }
    public Guid? AcademicYearId { get; set; }
}
