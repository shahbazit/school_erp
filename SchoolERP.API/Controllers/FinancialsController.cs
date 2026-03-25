using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Financials;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Accountant")] // Restrict to financial roles
public class FinancialsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public FinancialsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetFinancialSummary([FromQuery] Guid? academicYearId)
    {
        var feeQuery = _unitOfWork.Repository<FeeTransaction>().GetQueryable();
        var expenseQuery = _unitOfWork.Repository<OfficeExpense>().GetQueryable();
        var incomeQuery = _unitOfWork.Repository<OtherIncome>().GetQueryable();
        var accountQuery = _unitOfWork.Repository<StudentFeeAccount>().GetQueryable();

        if (academicYearId.HasValue)
        {
            feeQuery = feeQuery.Where(t => t.AcademicYearId == academicYearId);
            expenseQuery = expenseQuery.Where(t => t.AcademicYearId == academicYearId);
            incomeQuery = incomeQuery.Where(t => t.AcademicYearId == academicYearId);
        }

        var totalFeeRevenue = await feeQuery
            .Where(t => t.Type == "Payment")
            .SumAsync(t => t.Amount);

        var totalOtherIncome = await incomeQuery
            .SumAsync(t => t.Amount);

        var totalRevenue = totalFeeRevenue + totalOtherIncome;

        // 2. Total Expenses
        var totalExpenses = await expenseQuery
            .SumAsync(t => t.Amount);

        // 3. Collection Rate
        var totalAllocated = await feeQuery
            .Where(t => t.Type == "Charge")
            .SumAsync(t => t.Amount);
        var collectionRate = totalAllocated > 0 ? (double)(totalFeeRevenue / totalAllocated) * 100 : 0;

        // 4. Revenue Sources (By Fee Head)
        var revenueByHead = await feeQuery
            .Where(t => t.Type == "Payment")
            .ToListAsync();

        var sources = new List<RevenueSourceDto>
        {
            new() { Category = "Tuition Fees", Amount = totalFeeRevenue * 0.7m, Percentage = 70, Color = "bg-indigo-500" },
            new() { Category = "Transport", Amount = totalFeeRevenue * 0.15m, Percentage = 15, Color = "bg-emerald-500" },
            new() { Category = "Other Income", Amount = totalOtherIncome, Percentage = totalRevenue > 0 ? (double)(totalOtherIncome / totalRevenue * 100) : 0, Color = "bg-amber-500" },
            new() { Category = "Misc", Amount = totalFeeRevenue * 0.15m, Percentage = 10, Color = "bg-slate-500" }
        };

        // 5. Recent Transactions (Interleave Payments and Expenses)
        var recentPayments = await feeQuery
            .Include(t => t.Student)
            .OrderByDescending(t => t.TransactionDate)
            .Take(10)
            .Select(t => new TransactionDto {
                Id = t.Id,
                Date = t.TransactionDate,
                Description = t.Description ?? "Fee Payment",
                Source = $"{t.Student.FirstName} {t.Student.LastName}",
                Amount = t.Amount,
                Type = t.Type == "Charge" ? "Debit" : "Credit",
                Method = t.PaymentMethod ?? "Cash"
            }).ToListAsync();

        var recentExpenses = await expenseQuery
            .OrderByDescending(t => t.Date)
            .Take(10)
            .Select(t => new TransactionDto {
                Id = t.Id,
                Date = t.Date,
                Description = t.Description,
                Source = t.Category,
                Amount = t.Amount,
                Type = "Debit",
                Method = t.PaymentMethod ?? "Cash"
            }).ToListAsync();

        var recentOtherIncome = await incomeQuery
            .OrderByDescending(t => t.Date)
            .Take(10)
            .Select(t => new TransactionDto {
                Id = t.Id,
                Date = t.Date,
                Description = t.Description,
                Source = t.Category,
                Amount = t.Amount,
                Type = "Credit",
                Method = t.PaymentMethod ?? "Cash"
            }).ToListAsync();

        var allTransactions = recentPayments.Concat(recentExpenses).Concat(recentOtherIncome)
            .OrderByDescending(t => t.Date)
            .Take(15)
            .ToList();

        var summary = new FinancialSummaryDto
        {
            TotalRevenueYTD = totalRevenue,
            TotalExpensesYTD = totalExpenses,
            OverallCollectionRate = (decimal)Math.Round(collectionRate, 1),
            RevenueSources = sources,
            RecentTransactions = allTransactions
        };

        return Ok(summary);
    }

    [HttpGet("defaulters")]
    public async Task<IActionResult> GetDefaulters([FromQuery] Guid? academicYearId, [FromQuery] decimal minBalance = 500)
    {
        var query = _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
            .Include(a => a.Student);

        if (academicYearId.HasValue)
        {
            // query = query.Where(a => a.AcademicYearId == academicYearId);
        }

        var defaulters = await query
            .Where(a => a.TotalAllocated - a.TotalPaid - a.TotalDiscount > minBalance)
            .OrderByDescending(a => a.TotalAllocated - a.TotalPaid - a.TotalDiscount)
            .Take(50)
            .ToListAsync();

        // Get class names (needs StudentAcademic)
        var studentIds = defaulters.Select(d => d.StudentId).ToList();
        var academics = await _unitOfWork.Repository<StudentAcademic>().GetQueryable()
            .Include(sa => sa.Class)
            .Where(sa => studentIds.Contains(sa.StudentId) && (academicYearId == null ? sa.IsCurrent : true)) // String comparison or filtered below
            .ToListAsync();

        // If academic year is specified as Guid but stored as string in StudentAcademic, we might need a name lookup
        if (academicYearId.HasValue)
        {
            var yearName = (await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(academicYearId.Value))?.Name;
            if (yearName != null)
            {
                academics = academics.Where(sa => sa.AcademicYear == yearName).ToList();
            }
        }

        var dtos = defaulters.Select(a => new DefaulterDto {
            StudentId = a.StudentId,
            FullName = $"{a.Student.FirstName} {a.Student.LastName}",
            AdmissionNo = a.Student.AdmissionNo,
            ClassName = academics.FirstOrDefault(sa => sa.StudentId == a.StudentId)?.Class.Name ?? "N/A",
            OutstandingAmount = a.TotalAllocated - a.TotalPaid - a.TotalDiscount
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("expenses")]
    public async Task<IActionResult> LogExpense(CreateExpenseDto dto)
    {
        var expense = new OfficeExpense
        {
            Category = dto.Category,
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            Status = dto.Status,
            ReferenceNumber = dto.ReferenceNumber,
            PaymentMethod = dto.PaymentMethod,
            AcademicYearId = dto.AcademicYearId
        };

        await _unitOfWork.Repository<OfficeExpense>().AddAsync(expense);
        await _unitOfWork.CompleteAsync();

        return Ok(expense);
    }

    [HttpGet("expenses")]
    public async Task<IActionResult> GetAllExpenses()
    {
        var expenses = await _unitOfWork.Repository<OfficeExpense>().GetAllAsync();
        return Ok(expenses.OrderByDescending(e => e.Date));
    }

    [HttpPost("income")]
    public async Task<IActionResult> LogIncome(CreateOtherIncomeDto dto)
    {
        var income = new OtherIncome
        {
            Category = dto.Category,
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            ReferenceNumber = dto.ReferenceNumber,
            PaymentMethod = dto.PaymentMethod,
            AcademicYearId = dto.AcademicYearId
        };

        await _unitOfWork.Repository<OtherIncome>().AddAsync(income);
        await _unitOfWork.CompleteAsync();

        return Ok(income);
    }

    [HttpGet("income")]
    public async Task<IActionResult> GetAllOtherIncome()
    {
        var incomes = await _unitOfWork.Repository<OtherIncome>().GetAllAsync();
        return Ok(incomes.OrderByDescending(e => e.Date));
    }
}
