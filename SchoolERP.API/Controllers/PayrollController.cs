using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Payroll;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,HR")]
public class PayrollController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public PayrollController(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    // ── Salary Structures ──────────────────────────────────────────────────

    [HttpGet("structures")]
    public async Task<IActionResult> GetStructures()
    {
        var structures = await _unitOfWork.Repository<SalaryStructure>().GetQueryable()
            .Include(s => s.Components)
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
        var structure = new SalaryStructure
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = dto.IsActive,
            Components = dto.Components.Select(c => new SalaryComponent
            {
                Name = c.Name,
                Type = c.Type,
                Amount = c.Amount
            }).ToList()
        };

        await _unitOfWork.Repository<SalaryStructure>().AddAsync(structure);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Salary Structure created successfully." });
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

        var existing = await _unitOfWork.Repository<EmployeeSalary>().GetQueryable()
            .FirstOrDefaultAsync(s => s.EmployeeId == dto.EmployeeId);

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
                NetSalary = totalEarnings - totalDeductions
            };
            await _unitOfWork.Repository<EmployeeSalary>().AddAsync(assignment);
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Salary assigned successfully." });
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
        var existingRun = await _unitOfWork.Repository<PayrollRun>().GetQueryable()
            .FirstOrDefaultAsync(r => r.Year == dto.Year && r.Month == dto.Month);
            
        if (existingRun != null && existingRun.Status != PayrollStatus.Draft)
            return BadRequest("Payroll for this month has already been processed and locked.");

        // Fetch all active employees with assigned salaries
        var employeeSalaries = await _unitOfWork.Repository<EmployeeSalary>().GetQueryable()
            .Include(es => es.SalaryStructure)
                .ThenInclude(ss => ss!.Components)
            .Include(es => es.Employee)
            .Where(es => es.Employee!.IsActive)
            .ToListAsync();

        if (!employeeSalaries.Any())
            return BadRequest("No active employees with assigned salary structures found.");

        PayrollRun run = existingRun ?? new PayrollRun
        {
            Year = dto.Year,
            Month = dto.Month,
            ProcessedById = _currentUserService.UserId,
            Status = PayrollStatus.Draft,
            Remarks = dto.Remarks
        };

        if (existingRun == null)
            await _unitOfWork.Repository<PayrollRun>().AddAsync(run);

        // Calculate and build details
        var details = new List<PayrollDetail>();
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

            details.Add(new PayrollDetail
            {
                EmployeeId = es.EmployeeId,
                GrossSalary = gross,
                TotalDeductions = deductions,
                NetSalary = net,
                ComponentBreakdownDetails = JsonSerializer.Serialize(componentBreakdown)
            });
        }

        run.TotalAmount = totalAmount;
        run.PayrollDetails = details;
        run.ProcessedDate = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Payroll processed successfully.", runId = run.Id });
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
}
