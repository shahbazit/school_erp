using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Leave;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public LeaveController(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    // ── Leave Types ────────────────────────────────────────────────────────

    [HttpGet("types")]
    public async Task<IActionResult> GetLeaveTypes()
    {
        var types = await _unitOfWork.Repository<LeaveType>().GetQueryable()
            .Where(t => t.IsActive)
            .Select(t => new LeaveTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                MaxDaysPerYear = t.MaxDaysPerYear,
                IsActive = t.IsActive
            })
            .ToListAsync();
        return Ok(types);
    }

    [HttpPost("types")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> CreateLeaveType([FromBody] CreateLeaveTypeDto dto)
    {
        var type = new LeaveType
        {
            Name = dto.Name,
            Description = dto.Description,
            MaxDaysPerYear = dto.MaxDaysPerYear
        };
        await _unitOfWork.Repository<LeaveType>().AddAsync(type);
        await _unitOfWork.CompleteAsync();
        return Ok(type);
    }

    // ── Leave Applications ──────────────────────────────────────────────────

    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications([FromQuery] Guid? employeeId, [FromQuery] LeaveStatus? status)
    {
        var query = _unitOfWork.Repository<LeaveApplication>().GetQueryable()
            .Include(a => a.Employee)
            .Include(a => a.LeaveType)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(a => a.EmployeeId == employeeId.Value);
        
        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        var applications = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new LeaveApplicationDto
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = $"{a.Employee!.FirstName} {a.Employee.LastName}",
                LeaveTypeId = a.LeaveTypeId,
                LeaveTypeName = a.LeaveType!.Name,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                TotalDays = (decimal)(a.EndDate.Date - a.StartDate.Date).TotalDays + 1,
                Reason = a.Reason,
                Status = a.Status,
                ActionDate = a.ActionDate,
                ActionRemarks = a.ActionRemarks,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(applications);
    }

    [HttpPost("apply")]
    public async Task<IActionResult> ApplyLeave([FromBody] ApplyLeaveDto dto)
    {
        // Get current employee ID linked to this user (assuming 1-to-1 for simplicity or finding via email)
        var userId = _currentUserService.UserId;
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .FirstOrDefaultAsync(e => e.Id == userId); // In a real app, you'd match by user FK or email

        if (employee == null) return BadRequest("Authenticated user is not an employee.");

        var leaveType = await _unitOfWork.Repository<LeaveType>().GetByIdAsync(dto.LeaveTypeId);
        if (leaveType == null) return NotFound("Leave type not found.");

        var requestedDays = (decimal)(dto.EndDate.Date - dto.StartDate.Date).TotalDays + 1;
        if (requestedDays <= 0) return BadRequest("Invalid date range.");

        // Check Balance
        var currentYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(y => y.IsActive);
        if (currentYear == null) return BadRequest("Active academic year not found.");

        var balance = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
            .FirstOrDefaultAsync(b => b.EmployeeId == employee.Id && b.LeaveTypeId == dto.LeaveTypeId && b.AcademicYearId == currentYear.Id);

        if (balance == null)
        {
            // Initialize balance if not exists (assume starting fresh)
            balance = new LeaveBalance
            {
                EmployeeId = employee.Id,
                LeaveTypeId = dto.LeaveTypeId,
                AcademicYearId = currentYear.Id,
                TotalDays = leaveType.MaxDaysPerYear,
                ConsumedDays = 0
            };
            await _unitOfWork.Repository<LeaveBalance>().AddAsync(balance);
        }

        if (balance.RemainingDays < requestedDays)
            return BadRequest($"Insufficient leave balance. Remaining: {balance.RemainingDays}, Requested: {requestedDays}");

        var application = new LeaveApplication
        {
            EmployeeId = employee.Id,
            LeaveTypeId = dto.LeaveTypeId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            Status = LeaveStatus.Pending
        };

        await _unitOfWork.Repository<LeaveApplication>().AddAsync(application);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Leave application submitted successfully.", id = application.Id });
    }

    [HttpPut("applications/{id}/action")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> ProcessLeave(Guid id, [FromBody] LeaveActionDto dto)
    {
        var application = await _unitOfWork.Repository<LeaveApplication>().GetQueryable()
            .Include(a => a.LeaveType)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application == null) return NotFound();
        if (application.Status != LeaveStatus.Pending) return BadRequest("Application is already processed.");

        application.Status = dto.Status;
        application.ActionRemarks = dto.Remarks;
        application.ActionDate = DateTime.UtcNow;
        application.ApprovedById = _currentUserService.UserId;

        if (dto.Status == LeaveStatus.Approved)
        {
            var requestedDays = (decimal)(application.EndDate.Date - application.StartDate.Date).TotalDays + 1;

            var currentYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                .FirstOrDefaultAsync(y => y.IsActive);
            
            var balance = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
                .FirstOrDefaultAsync(b => b.EmployeeId == application.EmployeeId && b.LeaveTypeId == application.LeaveTypeId && b.AcademicYearId == currentYear!.Id);

            if (balance != null)
            {
                balance.ConsumedDays += requestedDays;
                _unitOfWork.Repository<LeaveBalance>().Update(balance);
            }
        }

        _unitOfWork.Repository<LeaveApplication>().Update(application);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = $"Leave application {dto.Status.ToString().ToLower()} successfully." });
    }

    [HttpGet("balances/{employeeId}")]
    public async Task<IActionResult> GetBalances(Guid employeeId)
    {
        var balances = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
            .Include(b => b.LeaveType)
            .Where(b => b.EmployeeId == employeeId)
            .Select(b => new LeaveBalanceDto
            {
                Id = b.Id,
                EmployeeId = b.EmployeeId,
                LeaveTypeId = b.LeaveTypeId,
                LeaveTypeName = b.LeaveType!.Name,
                TotalDays = b.TotalDays,
                ConsumedDays = b.ConsumedDays,
                RemainingDays = b.RemainingDays
            })
            .ToListAsync();

        return Ok(balances);
    }
}
