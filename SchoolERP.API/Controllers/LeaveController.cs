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
    private readonly IOrganizationService _organizationService;

    public LeaveController(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IOrganizationService organizationService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _organizationService = organizationService;
    }

    // ── Leave Plan Management ────────────────────────────────────────────────
    
    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _unitOfWork.Repository<LeavePlan>().GetQueryable()
            .Where(p => p.IsActive)
            .Select(p => new LeavePlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                IsActive = p.IsActive,
                IsDefault = p.IsDefault,
                EmployeeCount = p.Employees.Count()
            })
            .ToListAsync();
        return Ok(plans);
    }

    [HttpPost("plans")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> CreatePlan([FromBody] CreateLeavePlanDto dto)
    {
        var plan = new LeavePlan
        {
            Name = dto.Name,
            Description = dto.Description
        };
        await _unitOfWork.Repository<LeavePlan>().AddAsync(plan);
        await _unitOfWork.CompleteAsync();
        return Ok(plan);
    }

    [HttpPost("plans/{id}/delete")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> DeletePlan(Guid id)
    {
        var plan = await _unitOfWork.Repository<LeavePlan>().GetByIdAsync(id);
        if (plan == null) return NotFound();

        var count = await _unitOfWork.Repository<Employee>().GetQueryable()
            .CountAsync(e => e.LeavePlanId == id);
            
        if (count > 0) return BadRequest("This leave plan is currently assigned to employees and cannot be deleted.");

        var types = await _unitOfWork.Repository<LeaveType>().GetQueryable()
            .Where(t => t.LeavePlanId == id)
            .ToListAsync();
            
        foreach (var type in types)
        {
            _unitOfWork.Repository<LeaveType>().Delete(type);
        }

        _unitOfWork.Repository<LeavePlan>().Delete(plan);
        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Leave plan and all its categories deleted successfully." });
    }

    [HttpPost("plans/{id}/set-default")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> SetDefaultPlan(Guid id)
    {
        var plans = await _unitOfWork.Repository<LeavePlan>().GetQueryable().ToListAsync();
        var targetPlan = plans.FirstOrDefault(p => p.Id == id);
        if (targetPlan == null) return NotFound();

        foreach (var p in plans)
        {
            p.IsDefault = (p.Id == id);
            _unitOfWork.Repository<LeavePlan>().Update(p);
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = $"{targetPlan.Name} set as default plan." });
    }

    // ── Leave Types ────────────────────────────────────────────────────────

    [HttpGet("types/my")]
    public async Task<IActionResult> GetMyTypes()
    {
        var orgId = _organizationService.GetOrganizationId();
        var userId = _currentUserService.UserId;
        
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null) return Ok(new List<LeaveTypeDto>());
        
        Guid? planId = employee.LeavePlanId;

        if (!planId.HasValue)
        {
            var defaultPlan = await _unitOfWork.Repository<LeavePlan>().GetQueryable()
                .FirstOrDefaultAsync(p => p.OrganizationId == orgId && p.IsDefault);
            planId = defaultPlan?.Id;
        }

        if (!planId.HasValue) return Ok(new List<LeaveTypeDto>());

        return await GetLeaveTypes(planId);
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetLeaveTypes([FromQuery] Guid? planId)
    {
        var orgId = _organizationService.GetOrganizationId();
        var query = _unitOfWork.Repository<LeaveType>().GetQueryable()
            .Where(t => t.OrganizationId == orgId && t.IsActive);
            
        if (planId.HasValue)
            query = query.Where(t => t.LeavePlanId == planId.Value);

        var types = await query
            .Select(t => new LeaveTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                MaxDaysPerYear = t.MaxDaysPerYear,
                IsActive = t.IsActive,
                IsMonthlyAccrual = t.IsMonthlyAccrual,
                AccrualRatePerMonth = t.AccrualRatePerMonth,
                CanCarryForward = t.CanCarryForward,
                MaxCarryForwardDays = t.MaxCarryForwardDays,
                LeavePlanId = t.LeavePlanId
            })
            .ToListAsync();
        return Ok(types);
    }

    [HttpPost("types/{id}/delete")]
    public async Task<IActionResult> DeleteType(Guid id)
    {
        var orgId = _organizationService.GetOrganizationId();
        
        // 1. Check if used in any Employee Leave Balance
        var isUsedInBalance = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
            .AnyAsync(b => b.LeaveTypeId == id);
            
        if (isUsedInBalance) 
            return BadRequest("Cannot delete this category because employees currently have active balances recorded for it.");

        // 2. Check if used in any Leave Application
        var isUsedInApplication = await _unitOfWork.Repository<LeaveApplication>().GetQueryable()
            .AnyAsync(a => a.LeaveTypeId == id);
            
        if (isUsedInApplication) 
            return BadRequest("Cannot delete this category because there are historical leave applications linked to it.");

        var leaveType = await _unitOfWork.Repository<LeaveType>().GetByIdAsync(id);
        if (leaveType == null || leaveType.OrganizationId != orgId) 
            return NotFound();

        _unitOfWork.Repository<LeaveType>().Delete(leaveType);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Leave Category deleted successfully." });
    }

    [HttpPost("types")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> CreateLeaveType([FromBody] CreateLeaveTypeDto dto)
    {
        var type = new LeaveType
        {
            Name = dto.Name,
            Description = dto.Description,
            MaxDaysPerYear = dto.MaxDaysPerYear,
            IsMonthlyAccrual = dto.IsMonthlyAccrual,
            AccrualRatePerMonth = dto.AccrualRatePerMonth,
            CanCarryForward = dto.CanCarryForward,
            MaxCarryForwardDays = dto.MaxCarryForwardDays,
            LeavePlanId = dto.LeavePlanId,
            OrganizationId = _organizationService.GetOrganizationId(),
            IsActive = true
        };
        await _unitOfWork.Repository<LeaveType>().AddAsync(type);
        await _unitOfWork.CompleteAsync();
        return Ok(type);
    }

    [HttpPost("types/{id}/update")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateLeaveType(Guid id, [FromBody] CreateLeaveTypeDto dto)
    {
        var type = await _unitOfWork.Repository<LeaveType>().GetByIdAsync(id);
        if (type == null) return NotFound();

        type.Name = dto.Name;
        type.Description = dto.Description;
        type.MaxDaysPerYear = dto.MaxDaysPerYear;
        type.IsMonthlyAccrual = dto.IsMonthlyAccrual;
        type.AccrualRatePerMonth = dto.AccrualRatePerMonth;
        type.CanCarryForward = dto.CanCarryForward;
        type.MaxCarryForwardDays = dto.MaxCarryForwardDays;

        _unitOfWork.Repository<LeaveType>().Update(type);
        await _unitOfWork.CompleteAsync();

        return Ok(type);
    }

    // ── Leave Applications ──────────────────────────────────────────────────

    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications([FromQuery] Guid? employeeId, [FromQuery] LeaveStatus? status, [FromQuery] Guid? academicYearId)
    {
        var academicYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(y => academicYearId.HasValue ? y.Id == academicYearId.Value : y.IsActive);

        var query = _unitOfWork.Repository<LeaveApplication>().GetQueryable()
            .Include(a => a.Employee)
            .Include(a => a.LeaveType)
            .Include(a => a.AcademicYear)
            .AsQueryable();

        if (academicYear != null)
            query = query.Where(a => a.AcademicYearId == academicYear.Id);

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
                TotalDays = ((decimal)(a.EndDate.Date - a.StartDate.Date).TotalDays + 1) * (a.DayType == LeaveDayType.Quarter ? 0.25m : (a.DayType == LeaveDayType.FullDay ? 1.0m : 0.5m)),
                Reason = a.Reason,
                AcademicYearId = a.AcademicYearId,
                AcademicYearName = a.AcademicYear!.Name,
                DayType = a.DayType,
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
        var userId = _currentUserService.UserId;
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null) return BadRequest("Authenticated user is not an employee.");

        var leaveType = await _unitOfWork.Repository<LeaveType>().GetByIdAsync(dto.LeaveTypeId);
        if (leaveType == null) return NotFound("Leave type not found.");

        var requestedDays = (decimal)(dto.EndDate.Date - dto.StartDate.Date).TotalDays + 1;
        var multiplier = dto.DayType switch
        {
            LeaveDayType.FirstHalf => 0.5m,
            LeaveDayType.SecondHalf => 0.5m,
            LeaveDayType.Quarter => 0.25m,
            _ => 1.0m
        };
        requestedDays *= multiplier;

        if (requestedDays <= 0) return BadRequest("Invalid date range.");

        var currentYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(y => y.IsActive);
        if (currentYear == null) return BadRequest("Active academic year not found.");

        var balance = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
            .FirstOrDefaultAsync(b => b.EmployeeId == employee.Id && b.LeaveTypeId == dto.LeaveTypeId && b.AcademicYearId == currentYear.Id);

        if (balance == null)
        {
            balance = new LeaveBalance
            {
                EmployeeId = employee.Id,
                LeaveTypeId = dto.LeaveTypeId,
                AcademicYearId = currentYear.Id,
                TotalDays = leaveType.MaxDaysPerYear,
                ConsumedDays = 0,
                InitialBalance = 0,
                Id = Guid.NewGuid()
            };
            await _unitOfWork.Repository<LeaveBalance>().AddAsync(balance);
        }

        decimal availableDays = balance.RemainingDays;
        
        if (leaveType.IsMonthlyAccrual)
        {
            var today = DateTime.UtcNow;
            int monthsPassed = ((today.Year - currentYear.StartDate.Year) * 12) + today.Month - currentYear.StartDate.Month + 1;
            monthsPassed = Math.Max(1, Math.Min(12, monthsPassed));
            
            decimal accruedSoFar = Math.Min(leaveType.MaxDaysPerYear, monthsPassed * leaveType.AccrualRatePerMonth);
            availableDays = (balance.InitialBalance + accruedSoFar) - balance.ConsumedDays;
        }

        if (availableDays < requestedDays)
            return BadRequest($"Insufficient accrued leave balance. Available so far: {availableDays}, Requested: {requestedDays}");

        var application = new LeaveApplication
        {
            EmployeeId = employee.Id,
            LeaveTypeId = dto.LeaveTypeId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            AcademicYearId = currentYear.Id,
            Reason = dto.Reason,
            DayType = dto.DayType,
            Status = LeaveStatus.Pending,
            OrganizationId = _organizationService.GetOrganizationId()
        };

        await _unitOfWork.Repository<LeaveApplication>().AddAsync(application);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Leave application submitted successfully.", id = application.Id });
    }

    [HttpPost("applications/{id}/action")]
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
            var multiplier = application.DayType switch
            {
                LeaveDayType.FirstHalf => 0.5m,
                LeaveDayType.SecondHalf => 0.5m,
                LeaveDayType.Quarter => 0.25m,
                _ => 1.0m
            };
            var requestedDays = ((decimal)(application.EndDate.Date - application.StartDate.Date).TotalDays + 1) * multiplier;

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

    // ── Leave Balances ──────────────────────────────────────────────────────

    [HttpGet("balances")]
    public async Task<IActionResult> GetMyBalances([FromQuery] Guid? academicYearId)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .FirstOrDefaultAsync(e => e.UserId == _currentUserService.UserId);
        
        if (employee == null) return NotFound("Employee profile not found for current user.");
        var balances = await GetBalancesInternal(employee.Id, academicYearId);
        return Ok(balances);
    }

    [HttpGet("balances/{employeeId}")]
    public async Task<IActionResult> GetBalances(Guid employeeId, [FromQuery] Guid? academicYearId = null)
    {
        var balances = await GetBalancesInternal(employeeId, academicYearId);
        return Ok(balances);
    }

    private async Task<List<LeaveBalanceDto>> GetBalancesInternal(Guid employeeId, Guid? academicYearId)
    {
        var year = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(y => academicYearId.HasValue ? y.Id == academicYearId.Value : y.IsActive);

        var query = _unitOfWork.Repository<LeaveBalance>().GetQueryable()
            .Include(b => b.LeaveType)
            .Where(b => b.EmployeeId == employeeId);

        if (year != null)
            query = query.Where(b => b.AcademicYearId == year.Id);

        return await query.Select(b => new LeaveBalanceDto
        {
            Id = b.Id,
            EmployeeId = b.EmployeeId,
            LeaveTypeId = b.LeaveTypeId,
            LeaveTypeName = b.LeaveType!.Name,
            InitialBalance = b.InitialBalance,
            TotalDays = b.TotalDays,
            ConsumedDays = b.ConsumedDays,
            RemainingDays = b.RemainingDays
        })
        .ToListAsync();
    }

    [HttpPost("balances/update")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateBalance([FromBody] UpdateLeaveBalanceDto dto)
    {
        var currentYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(y => y.IsActive);
        
        if (currentYear == null) return BadRequest("Active academic year not found.");

        var balance = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
            .FirstOrDefaultAsync(b => b.EmployeeId == dto.EmployeeId && b.LeaveTypeId == dto.LeaveTypeId && b.AcademicYearId == currentYear.Id);

        if (balance == null)
        {
            balance = new LeaveBalance
            {
                EmployeeId = dto.EmployeeId,
                LeaveTypeId = dto.LeaveTypeId,
                AcademicYearId = currentYear.Id,
                InitialBalance = dto.InitialBalance,
                TotalDays = dto.TotalDays,
                ConsumedDays = 0,
                Id = Guid.NewGuid()
            };
            await _unitOfWork.Repository<LeaveBalance>().AddAsync(balance);
        }
        else
        {
            balance.InitialBalance = dto.InitialBalance;
            balance.TotalDays = dto.TotalDays;
            _unitOfWork.Repository<LeaveBalance>().Update(balance);
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Leave balance updated successfully." });
    }

    [HttpPost("balances/bulk-initialize")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> BulkInitializeBalances([FromBody] BulkInitializeLeaveBalanceDto dto)
    {
        var currentYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .FirstOrDefaultAsync(y => y.IsActive);
        
        if (currentYear == null) return BadRequest("Active academic year not found.");

        var employees = await _unitOfWork.Repository<Employee>().GetQueryable()
            .Where(e => e.IsActive)
            .ToListAsync();

        foreach (var emp in employees)
        {
            var existing = await _unitOfWork.Repository<LeaveBalance>().GetQueryable()
                .FirstOrDefaultAsync(b => b.EmployeeId == emp.Id && b.LeaveTypeId == dto.LeaveTypeId && b.AcademicYearId == currentYear.Id);

            if (existing == null)
            {
                var newBalance = new LeaveBalance
                {
                    EmployeeId = emp.Id,
                    LeaveTypeId = dto.LeaveTypeId,
                    AcademicYearId = currentYear.Id,
                    InitialBalance = dto.InitialBalance,
                    TotalDays = dto.TotalDays,
                    ConsumedDays = 0,
                    Id = Guid.NewGuid()
                };
                await _unitOfWork.Repository<LeaveBalance>().AddAsync(newBalance);
            }
        }

        await _unitOfWork.CompleteAsync();
        return Ok(new { message = "Leave balances initialized for all active employees." });
    }
}
