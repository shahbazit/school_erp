using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IFinanceReportService _reportService;
    private readonly IOrganizationService _organizationService;

    public FinanceController(ApplicationDbContext context, IFinanceReportService reportService, IOrganizationService organizationService)
    {
        _context = context;
        _reportService = reportService;
        _organizationService = organizationService;
    }

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts([FromQuery] Guid? academicYearId)
    {
        var summaries = await _reportService.GetAccountSummariesAsync(academicYearId);
        
        // Owner Restriction: If not Admin/Owner, filter by owner employee Id
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && userRole != "Owner")
        {
            var userIdStr = User.FindFirst("id")?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
                if (employee != null)
                {
                    summaries = summaries.Where(s => s.AccountId == Guid.Empty || // Allow shared/undefined if any
                                                   _context.FinancialAccounts.Any(fa => fa.Id == s.AccountId && fa.OwnerEmployeeId == employee.Id)).ToList();
                }
            }
        }
        
        return Ok(summaries);
    }

    [HttpGet("accounts/{id}/ledger")]
    public async Task<IActionResult> GetLedger(Guid id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var ledger = await _reportService.GetAccountLedgerAsync(id, startDate, endDate);
        return Ok(ledger);
    }

    // Account Management
    [HttpGet("list-accounts")]
    public async Task<IActionResult> ListAccounts()
    {
        var query = _context.FinancialAccounts.AsQueryable();
        
        // Owner Restriction
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && userRole != "Owner")
        {
            var userIdStr = User.FindFirst("id")?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
                if (employee != null)
                {
                    query = query.Where(fa => fa.OwnerEmployeeId == employee.Id);
                }
                else
                {
                    // If employee record not found but user is not admin, they see nothing by default (security first)
                    return Ok(new List<FinancialAccount>());
                }
            }
        }

        var accounts = await query.ToListAsync();
        return Ok(accounts);
    }

    [HttpPost("accounts")]
    public async Task<IActionResult> CreateAccount(FinancialAccount account)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return Unauthorized();

        account.OrganizationId = orgId;
        
        // Automatically set owner to current employee if not specified
        if (account.OwnerEmployeeId == null || account.OwnerEmployeeId == Guid.Empty)
        {
            var userIdStr = User.FindFirst("id")?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
                if (employee != null)
                {
                    account.OwnerEmployeeId = employee.Id;
                }
            }
        }

        _context.FinancialAccounts.Add(account);
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    [HttpPost("accounts/{id}/update")]
    public async Task<IActionResult> UpdateAccount(Guid id, FinancialAccount account)
    {
        var existing = await _context.FinancialAccounts.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = account.Name;
        existing.AccountType = account.AccountType;
        existing.Description = account.Description;
        existing.IsActive = account.IsActive;
        existing.OwnerEmployeeId = account.OwnerEmployeeId;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpPost("accounts/{id}/delete")]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var existing = await _context.FinancialAccounts.FindAsync(id);
        if (existing == null) return NotFound();

        // Perform soft delete or hard delete? Let's stay hard delete for now as per previous logic.
        _context.FinancialAccounts.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Account deleted successfully." });
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> TransferFunds(TransferFundsRequest request)
    {
        try
        {
            await _reportService.TransferFundsAsync(request);
            return Ok(new { message = "Funds transferred successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
