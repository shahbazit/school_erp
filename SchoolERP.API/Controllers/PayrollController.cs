using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Payroll;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;

namespace SchoolERP.API.Controllers;

[Route("api/payroll")]
[ApiController]
[Authorize(Roles = "Admin,HR")]
public class PayrollController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IOrganizationService _organizationService;

    public PayrollController(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IOrganizationService organizationService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _organizationService = organizationService;
    }

    // ── Salary Structures ──────────────────────────────────────────────────

    [HttpGet("structures")]
    public async Task<IActionResult> GetStructures()
    {
        var orgId = _organizationService.GetOrganizationId();
        var structures = await _unitOfWork.Repository<SalaryStructure>().GetQueryable()
            .Include(s => s.Components)
            .Where(s => s.OrganizationId == orgId)
            .Select(s => new SalaryStructureDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                IsActive = s.IsActive,
                TotalEarnings = s.Components.Where(c => c.Type == SalaryComponentType.Earning).Sum(c => c.Amount),
                TotalDeductions = s.Components.Where(c => c.Type == SalaryComponentType.Deduction).Sum(c => c.Amount),
                Components = s.Components.Select(c => new SalaryComponentDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Type = c.Type,
                    Amount = c.Amount
                }).ToList()
            })
            .ToListAsync();

        return Ok(structures);
    }

    [HttpPost("structures")]
    public async Task<IActionResult> CreateStructure([FromBody] UpsertSalaryStructureDto dto)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return BadRequest("Organization ID context is missing. Please ensure you are logged in and have selected an organization.");
        var structure = new SalaryStructure
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = dto.IsActive,
            OrganizationId = orgId,
            Components = dto.Components.Select(c => new SalaryComponent
            {
                Name = c.Name,
                Type = c.Type,
                Amount = c.Amount,
                OrganizationId = orgId
            }).ToList()
        };

        await _unitOfWork.Repository<SalaryStructure>().AddAsync(structure);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Salary Structure created successfully." });
    }

    [HttpPost("structures/{id}/update")]
    public async Task<IActionResult> UpdateStructure(Guid id, [FromBody] UpsertSalaryStructureDto dto)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return BadRequest("Organization ID is missing.");

        // 1. Update the structure directly using Bulk Update to bypass all tracking/filter issues
        // This also handles repairing legacy records (OrganizationId = Empty) in one go
        var affected = await _unitOfWork.Repository<SalaryStructure>().GetQueryable()
            .IgnoreQueryFilters()
            .Where(s => s.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Name, dto.Name)
                .SetProperty(x => x.Description, dto.Description)
                .SetProperty(x => x.IsActive, dto.IsActive)
                .SetProperty(x => x.OrganizationId, orgId)
                .SetProperty(x => x.UpdatedAt, DateTime.UtcNow)
                .SetProperty(x => x.UpdatedBy, _currentUserService.UserId));

        if (affected == 0) return NotFound();

        // 2. Proactively delete old components using Direct SQL (Bulk Delete)
        await _unitOfWork.Repository<SalaryComponent>().GetQueryable()
            .IgnoreQueryFilters()
            .Where(c => c.SalaryStructureId == id)
            .ExecuteDeleteAsync();

        // 3. Add new components
        foreach (var c in dto.Components)
        {
            var component = new SalaryComponent
            {
                Name = c.Name,
                Type = c.Type,
                Amount = c.Amount,
                OrganizationId = orgId,
                SalaryStructureId = id
            };
            await _unitOfWork.Repository<SalaryComponent>().AddAsync(component);
        }

        // 4. Save the new components
        // Note: The structure update and old components deletion were already committed to the DB
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Salary Structure updated successfully." });
    }

    [HttpPost("structures/{id}/delete")]
    public async Task<IActionResult> DeleteStructure(Guid id)
    {
        var orgId = _organizationService.GetOrganizationId();
        
        // Check if assigned to any employee
        var isAssigned = await _unitOfWork.Repository<EmployeeSalary>().GetQueryable()
            .AnyAsync(s => s.SalaryStructureId == id);
            
        if (isAssigned) return BadRequest("Cannot delete structure because it is currently assigned to employees.");

        // Fetch with IgnoreQueryFilters to handle legacy data
        var structure = await _unitOfWork.Repository<SalaryStructure>().GetQueryable()
            .IgnoreQueryFilters()
            .Include(s => s.Components)
            .FirstOrDefaultAsync(s => s.Id == id && (s.OrganizationId == orgId || s.OrganizationId == Guid.Empty));

        if (structure == null) return NotFound();

        // Manual delete components (though cascade should handle it)
        var compRepo = _unitOfWork.Repository<SalaryComponent>();
        foreach (var comp in structure.Components.ToList())
        {
            compRepo.Delete(comp);
        }

        _unitOfWork.Repository<SalaryStructure>().Delete(structure);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Salary Structure deleted successfully." });
    }

    // ── Assign Salary ──────────────────────────────────────────────────────

    [HttpPost("assign")]
    public async Task<IActionResult> AssignSalary([FromBody] AssignSalaryDto dto)
    {
        var structure = await _unitOfWork.Repository<SalaryStructure>().GetQueryable()
            .Include(s => s.Components)
            .FirstOrDefaultAsync(s => s.Id == dto.SalaryStructureId);
            
        if (structure == null) return NotFound("Salary Structure not found.");

        var totalEarnings = structure.Components.Where(c => c.Type == SalaryComponentType.Earning).Sum(c => c.Amount);
        var totalDeductions = structure.Components.Where(c => c.Type == SalaryComponentType.Deduction).Sum(c => c.Amount);

        var orgId = _organizationService.GetOrganizationId();
        var existing = await _unitOfWork.Repository<EmployeeSalary>().GetQueryable()
            .FirstOrDefaultAsync(s => s.EmployeeId == dto.EmployeeId && s.OrganizationId == orgId);

        if (existing != null)
        {
            existing.SalaryStructureId = dto.SalaryStructureId;
            existing.GrossSalary = totalEarnings;
            existing.NetSalary = totalEarnings - totalDeductions;
            _unitOfWork.Repository<EmployeeSalary>().Update(existing);
        }
        else
        {
            var assignment = new EmployeeSalary
            {
                EmployeeId = dto.EmployeeId,
                SalaryStructureId = dto.SalaryStructureId,
                GrossSalary = totalEarnings,
                NetSalary = totalEarnings - totalDeductions,
                OrganizationId = orgId
            };
            await _unitOfWork.Repository<EmployeeSalary>().AddAsync(assignment);
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Salary assigned successfully." });
    }

    [HttpGet("salaries")]
    public async Task<IActionResult> GetEmployeeSalaries()
    {
        var employees = await _unitOfWork.Repository<Employee>().GetQueryable()
            .Include(e => e.EmployeeSalary)
                .ThenInclude(es => es!.SalaryStructure)
            .Select(e => new EmployeeSalaryDto
            {
                EmployeeId = e.Id,
                EmployeeCode = e.EmployeeCode,
                EmployeeName = $"{e.FirstName} {e.LastName}",
                SalaryStructureId = e.EmployeeSalary != null ? e.EmployeeSalary.SalaryStructureId : Guid.Empty,
                SalaryStructureName = e.EmployeeSalary != null && e.EmployeeSalary.SalaryStructure != null 
                    ? e.EmployeeSalary.SalaryStructure.Name 
                    : "No Plan Assigned",
                GrossSalary = e.EmployeeSalary != null ? e.EmployeeSalary.GrossSalary : 0,
                NetSalary = e.EmployeeSalary != null ? e.EmployeeSalary.NetSalary : 0
            })
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetEmployeeSalary(Guid employeeId)
    {
        var salary = await _unitOfWork.Repository<EmployeeSalary>().GetQueryable()
            .Include(es => es.SalaryStructure)
            .Where(es => es.EmployeeId == employeeId)
            .Select(es => new EmployeeSalaryDto
            {
                Id = es.Id,
                EmployeeId = es.EmployeeId,
                EmployeeCode = es.Employee!.EmployeeCode,
                EmployeeName = $"{es.Employee!.FirstName} {es.Employee!.LastName}",
                SalaryStructureId = es.SalaryStructureId,
                SalaryStructureName = es.SalaryStructure!.Name,
                GrossSalary = es.GrossSalary,
                NetSalary = es.NetSalary
            })
            .FirstOrDefaultAsync();

        if (salary == null) return NotFound("Salary not assigned to this employee.");
        return Ok(salary);
    }

    // ── Payroll Processing ─────────────────────────────────────────────────

    [HttpGet("runs/{id}")]
    public async Task<IActionResult> GetPayrollRun(Guid id)
    {
        var run = await _unitOfWork.Repository<PayrollRun>().GetQueryable()
            .Include(r => r.PayrollDetails)
                .ThenInclude(d => d.Employee)
            .Include(r => r.ProcessedBy)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (run == null) return NotFound();

        return Ok(new PayrollRunDto
        {
            Id = run.Id,
            Year = run.Year,
            Month = run.Month,
            ProcessedDate = run.ProcessedDate,
            ProcessedByName = run.ProcessedBy != null ? $"{run.ProcessedBy.FirstName} {run.ProcessedBy.LastName}" : string.Empty,
            Status = run.Status,
            TotalAmount = run.TotalAmount,
            EmployeeCount = run.PayrollDetails.Count,
            Remarks = run.Remarks,
            Details = run.PayrollDetails.Select(d => new PayrollDetailDto
            {
                Id = d.Id,
                EmployeeId = d.EmployeeId,
                EmployeeCode = d.Employee?.EmployeeCode ?? string.Empty,
                EmployeeName = $"{d.Employee?.FirstName} {d.Employee?.LastName}",
                GrossSalary = d.GrossSalary,
                TotalDeductions = d.TotalDeductions,
                AdjustmentEarnings = d.AdjustmentEarnings,
                AdjustmentDeductions = d.AdjustmentDeductions,
                AdjustmentRemarks = d.AdjustmentRemarks,
                NetSalary = d.NetSalary,
                ComponentBreakdownDetails = d.ComponentBreakdownDetails
            }).ToList()
        });
    }

    [HttpGet("runs")]
    public async Task<IActionResult> GetPayrollRuns()
    {
        var runs = await _unitOfWork.Repository<PayrollRun>().GetQueryable()
            .Include(r => r.PayrollDetails)
            .Include(r => r.ProcessedBy)
            .OrderByDescending(r => r.Year).ThenByDescending(r => r.Month)
            .Select(r => new PayrollRunDto
            {
                Id = r.Id,
                Year = r.Year,
                Month = r.Month,
                ProcessedDate = r.ProcessedDate,
                ProcessedByName = r.ProcessedBy != null ? $"{r.ProcessedBy.FirstName} {r.ProcessedBy.LastName}" : string.Empty,
                Status = r.Status,
                TotalAmount = r.TotalAmount,
                EmployeeCount = r.PayrollDetails.Count,
                Remarks = r.Remarks
            })
            .ToListAsync();

        return Ok(runs);
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayroll([FromBody] ProcessPayrollDto dto)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return BadRequest("Organization identity context not found.");

        // 1. Identify existing run using No-Tracking to avoid polluting the change tracker
        var existing = await _unitOfWork.Repository<PayrollRun>().GetQueryable()
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(r => r.Year == dto.Year && r.Month == dto.Month && r.OrganizationId == orgId)
            .Select(r => new { r.Id, r.Status })
            .FirstOrDefaultAsync();
            
        if (existing != null && existing.Status != PayrollStatus.Draft && existing.Status != PayrollStatus.Rejected)
            return BadRequest("Payroll for this month has already been processed and locked.");

        Guid runId;
        if (existing != null)
        {
            runId = existing.Id;
            // 2. Clear old details immediately via Direct SQL (Clean Slate)
            await _unitOfWork.Repository<PayrollDetail>().GetQueryable()
                .Where(d => d.PayrollRunId == runId)
                .ExecuteDeleteAsync();
        }
        else
        {
            // 3. Create a clean Run header if it doesn't exist
            var newRun = new PayrollRun
            {
                Year = dto.Year,
                Month = dto.Month,
                OrganizationId = orgId,
                Status = PayrollStatus.Draft,
                ProcessedById = _currentUserService.UserId,
                ProcessedDate = DateTime.UtcNow,
                Remarks = dto.Remarks,
                TotalAmount = 0
            };
            await _unitOfWork.Repository<PayrollRun>().AddAsync(newRun);
            await _unitOfWork.CompleteAsync(); // Commit to DB to ensure header exists
            runId = newRun.Id;
        }

        // 4. Fetch work context (Active employees and salaries)
        var employeeSalaries = await _unitOfWork.Repository<EmployeeSalary>().GetQueryable()
            .Include(es => es.SalaryStructure)
                .ThenInclude(ss => ss!.Components)
            .Include(es => es.Employee)
            .Where(es => es.Employee!.IsActive && es.OrganizationId == orgId)
            .ToListAsync();

        if (!employeeSalaries.Any())
            return BadRequest("No active employees with assigned salary structures found for this organization.");

        // 5. Calculate and build individual details
        decimal totalAmount = 0;
        foreach (var es in employeeSalaries)
        {
            var earningComps = es.SalaryStructure!.Components.Where(c => c.Type == SalaryComponentType.Earning).ToList();
            var deductionComps = es.SalaryStructure.Components.Where(c => c.Type == SalaryComponentType.Deduction).ToList();
            
            var gross = earningComps.Sum(c => c.Amount);
            var deductions = deductionComps.Sum(c => c.Amount);
            var net = gross - deductions;

            totalAmount += net;
            
            var componentBreakdown = es.SalaryStructure.Components.Select(c => new 
            {
                 c.Name,
                 Type = c.Type.ToString(),
                 c.Amount
            });

            var detail = new PayrollDetail
            {
                PayrollRunId = runId, // Link to the header ID explicitly
                EmployeeId = es.EmployeeId,
                GrossSalary = gross,
                TotalDeductions = deductions,
                NetSalary = net,
                ComponentBreakdownDetails = JsonSerializer.Serialize(componentBreakdown),
                OrganizationId = orgId
            };
            await _unitOfWork.Repository<PayrollDetail>().AddAsync(detail);
        }

        // 6. Commit the new details first
        await _unitOfWork.CompleteAsync();

        // 7. Update the main Run Header using Direct SQL (Update)
        // This ensures zero concurrency issues because we never use a tracked header entity for the update
        await _unitOfWork.Repository<PayrollRun>().GetQueryable()
            .IgnoreQueryFilters()
            .Where(r => r.Id == runId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.TotalAmount, totalAmount)
                .SetProperty(x => x.Remarks, dto.Remarks)
                .SetProperty(x => x.ProcessedById, _currentUserService.UserId)
                .SetProperty(x => x.ProcessedDate, DateTime.UtcNow)
                .SetProperty(x => x.Status, PayrollStatus.Draft));

        return Ok(new { message = "Payroll processed successfully.", runId = runId });
    }

    [HttpPost("runs/{id}/approve")]
    public async Task<IActionResult> ApprovePayroll(Guid id)
    {
        var run = await _unitOfWork.Repository<PayrollRun>().GetByIdAsync(id);
        if (run == null) return NotFound();
        
        if (run.Status != PayrollStatus.Draft && run.Status != PayrollStatus.Processed)
            return BadRequest("Cannot approve this payroll run.");

        run.Status = PayrollStatus.Approved;
        _unitOfWork.Repository<PayrollRun>().Update(run);
        await _unitOfWork.CompleteAsync();
        
        return Ok(new { message = "Payroll approved successfully." });
    }

    [HttpPost("runs/{id}/reject")]
    public async Task<IActionResult> RejectPayroll(Guid id)
    {
        var run = await _unitOfWork.Repository<PayrollRun>().GetByIdAsync(id);
        if (run == null) return NotFound();
        
        if (run.Status != PayrollStatus.Draft && run.Status != PayrollStatus.Processed)
            return BadRequest("Cannot reject this payroll run.");

        run.Status = PayrollStatus.Rejected;
        _unitOfWork.Repository<PayrollRun>().Update(run);
        await _unitOfWork.CompleteAsync();
        
        return Ok(new { message = "Payroll rejected successfully." });
    }

    [HttpPost("runs/{id}/pay")]
    public async Task<IActionResult> MarkAsPaid(Guid id)
    {
        var run = await _unitOfWork.Repository<PayrollRun>().GetByIdAsync(id);
        if (run == null) return NotFound();
        
        if (run.Status != PayrollStatus.Approved)
            return BadRequest("Only approved payroll runs can be marked as paid.");

        run.Status = PayrollStatus.Paid;
        _unitOfWork.Repository<PayrollRun>().Update(run);

        // Automatically log as an expense in Financials
        var academicYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(ay => ay.OrganizationId == run.OrganizationId && ay.IsCurrent);

        var expense = new OfficeExpense
        {
            Category = "Payroll",
            Description = $"Salary Disbursed for {new DateTime(run.Year, run.Month, 1):MMMM yyyy}",
            Amount = run.TotalAmount,
            Date = DateTime.UtcNow,
            Status = "Paid",
            ReferenceNumber = $"PAY-{run.Id.ToString().Split('-')[0].ToUpper()}",
            PaymentMethod = "Bank Transfer",
            AcademicYearId = academicYear?.Id,
            OrganizationId = run.OrganizationId
        };
        await _unitOfWork.Repository<OfficeExpense>().AddAsync(expense);

        await _unitOfWork.CompleteAsync();
        
        return Ok(new { message = "Payroll marked as paid and recorded in financials." });
    }

    [HttpPost("runs/details/{detailId}/adjust")]
    public async Task<IActionResult> UpdateAdjustment(Guid detailId, [FromBody] UpdateAdjustmentDto dto)
    {
        var detail = await _unitOfWork.Repository<PayrollDetail>().GetQueryable()
            .Include(d => d.PayrollRun)
            .FirstOrDefaultAsync(d => d.Id == detailId);
            
        if (detail == null) return NotFound();
        if (detail.PayrollRun?.Status != PayrollStatus.Draft && detail.PayrollRun?.Status != PayrollStatus.Rejected)
            return BadRequest("Can only adjust slips for payroll runs in Draft or Rejected status.");

        // Update detail
        detail.AdjustmentEarnings = dto.AdjustmentEarnings;
        detail.AdjustmentDeductions = dto.AdjustmentDeductions;
        detail.AdjustmentRemarks = dto.AdjustmentRemarks;
        detail.NetSalary = detail.GrossSalary - detail.TotalDeductions + dto.AdjustmentEarnings - dto.AdjustmentDeductions;

        _unitOfWork.Repository<PayrollDetail>().Update(detail);
        
        // Update header TotalAmount
        var runId = detail.PayrollRunId;
        await _unitOfWork.CompleteAsync(); // Save detail first

        var total = await _unitOfWork.Repository<PayrollDetail>().GetQueryable()
            .Where(d => d.PayrollRunId == runId)
            .SumAsync(d => d.NetSalary);

        await _unitOfWork.Repository<PayrollRun>().GetQueryable()
            .Where(r => r.Id == runId)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.TotalAmount, total));

        return Ok(new { message = "Adjustment saved successfully." });
    }

    [HttpGet("ledgers/{employeeId}")]
    public async Task<IActionResult> GetEmployeeLedger(Guid employeeId)
    {
        // 1. Regular Monthly Payroll History
        var payrollHistory = await _unitOfWork.Repository<PayrollDetail>().GetQueryable()
            .Include(d => d.PayrollRun)
            .Where(d => d.EmployeeId == employeeId && d.PayrollRun!.Status == PayrollStatus.Paid)
            .Select(d => new 
            {
                Type = "Salary",
                d.Id,
                Month = d.PayrollRun!.Month,
                Year = d.PayrollRun!.Year,
                d.NetSalary,
                Remarks = (string?)d.AdjustmentRemarks ?? d.PayrollRun.Remarks,
                Date = d.PayrollRun.ProcessedDate
            })
            .ToListAsync();

        // 2. Miscellaneous Payouts (Bonus, Advance, etc.)
        var miscPayouts = await _unitOfWork.Repository<OfficeExpense>().GetQueryable()
            .Where(e => e.LinkedEmployeeId == employeeId && e.Category == "Staff Payout")
            .Select(e => new 
            {
                Type = "Misc Payout",
                e.Id,
                Month = e.Date.Month,
                Year = e.Date.Year,
                NetSalary = e.Amount,
                Remarks = (string?)e.Description,
                Date = e.Date
            })
            .ToListAsync();

        var combined = payrollHistory.Concat(miscPayouts)
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .ToList();

        return Ok(combined);
    }

    [HttpPost("misc-payout")]
    public async Task<IActionResult> RecordMiscPayout([FromBody] MiscPayoutDto dto)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return BadRequest();

        var expense = new OfficeExpense
        {
            Category = "Staff Payout", // Distinguishable category
            Description = $"{dto.Type}: {dto.Remarks}",
            Amount = dto.Amount,
            Date = DateTime.UtcNow,
            Status = "Paid",
            ReferenceNumber = $"STF-{DateTime.UtcNow.Ticks % 1000000}",
            PaymentMethod = dto.PaymentMethod,
            OrganizationId = orgId,
            LinkedEmployeeId = dto.EmployeeId
        };
        
        await _unitOfWork.Repository<OfficeExpense>().AddAsync(expense);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Miscellaneous payout recorded successfully." });
    }
}

public class MiscPayoutDto
{
    public Guid EmployeeId { get; set; }
    public string Type { get; set; } = "Bonus"; // Bonus, Incentive, Advance, Arrears
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Bank Transfer";
    public string? Remarks { get; set; }
}

public class UpdateAdjustmentDto
{
    public decimal AdjustmentEarnings { get; set; }
    public decimal AdjustmentDeductions { get; set; }
    public string? AdjustmentRemarks { get; set; }
}
