using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Attendance;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class EmployeeAttendanceController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeAttendanceController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/employee-attendance/date/{date}
    // ─────────────────────────────────────────────────────────────────────
    [HttpGet("date/{date}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetByDate(DateTime date, [FromQuery] Guid? departmentId, [FromQuery] string? search)
    {
        var targetDate = date.Date; // ensure time is 00:00:00

        var existingRecords = await _unitOfWork.Repository<EmployeeAttendance>().GetQueryable()
            .Include(a => a.Employee)
                .ThenInclude(e => e!.Department)
            .Include(a => a.Employee)
                .ThenInclude(e => e!.Designation)
            .Where(a => a.AttendanceDate == targetDate && a.Employee!.IsActive)
            .ToListAsync();

        var existingIds = existingRecords.Select(r => r.EmployeeId).ToHashSet();

        // Get active employees who don't have records yet
        var employeesQuery = _unitOfWork.Repository<Employee>().GetQueryable()
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Where(e => e.IsActive && !existingIds.Contains(e.Id));

        if (departmentId.HasValue)
            employeesQuery = employeesQuery.Where(e => e.DepartmentId == departmentId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            employeesQuery = employeesQuery.Where(e =>
                (e.FirstName + " " + e.LastName).Contains(search) || e.EmployeeCode.Contains(search));
        }

        var missingEmployees = await employeesQuery.ToListAsync();

        // Combine
        var dtos = existingRecords.Select(MapToDto).ToList();
        
        foreach (var emp in missingEmployees)
        {
            dtos.Add(new EmployeeAttendanceDto
            {
                EmployeeId = emp.Id,
                EmployeeCode = emp.EmployeeCode,
                EmployeeName = $"{emp.FirstName} {emp.LastName}",
                DepartmentName = emp.Department?.Name,
                DesignationName = emp.Designation?.Name,
                ProfilePhoto = emp.ProfilePhoto,
                AttendanceDate = targetDate,
                Status = AttendanceStatus.Present, // Default assumption, frontend can change
            });
        }

        // Apply filters to existing records too if needed (since they were fetched separately)
        var filteredDtos = dtos.AsEnumerable();
        if (departmentId.HasValue)
            filteredDtos = filteredDtos.Where(d => existingRecords.Any(r => r.EmployeeId == d.EmployeeId && r.Employee?.DepartmentId == departmentId.Value) || missingEmployees.Any(e => e.Id == d.EmployeeId));
        if (!string.IsNullOrWhiteSpace(search))
            filteredDtos = filteredDtos.Where(d => d.EmployeeName.Contains(search, StringComparison.OrdinalIgnoreCase) || d.EmployeeCode.Contains(search, StringComparison.OrdinalIgnoreCase));

        return Ok(filteredDtos.OrderBy(d => d.EmployeeName).ToList());
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/employee-attendance/mark
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("mark")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> MarkAttendance([FromBody] BulkMarkAttendanceDto dto)
    {
        if (dto.Records == null || !dto.Records.Any())
            return BadRequest(new { message = "No records provided." });

        var employeeIds = dto.Records.Select(r => r.EmployeeId).Distinct().ToList();
        var dateKeys = dto.Records.Select(r => r.AttendanceDate.Date).Distinct().ToList();

        // Fetch existing records for fast lookup to update vs insert
        var existingRecords = await _unitOfWork.Repository<EmployeeAttendance>().GetQueryable()
            .Where(a => employeeIds.Contains(a.EmployeeId) && dateKeys.Contains(a.AttendanceDate))
            .ToListAsync();

        var toAdd = new List<EmployeeAttendance>();
        var toUpdate = new List<EmployeeAttendance>();

        foreach (var req in dto.Records)
        {
            var dateObj = req.AttendanceDate.Date;
            var existing = existingRecords.FirstOrDefault(r => r.EmployeeId == req.EmployeeId && r.AttendanceDate == dateObj);

            if (existing != null)
            {
                existing.Status = req.Status;
                existing.InTime = req.InTime;
                existing.OutTime = req.OutTime;
                existing.Remarks = req.Remarks;
                toUpdate.Add(existing);
            }
            else
            {
                toAdd.Add(new EmployeeAttendance
                {
                    EmployeeId = req.EmployeeId,
                    AttendanceDate = dateObj,
                    Status = req.Status,
                    InTime = req.InTime,
                    OutTime = req.OutTime,
                    Remarks = req.Remarks
                });
            }
        }

        foreach (var entity in toUpdate)
            _unitOfWork.Repository<EmployeeAttendance>().Update(entity);
            
        foreach (var entity in toAdd)
            await _unitOfWork.Repository<EmployeeAttendance>().AddAsync(entity);

        await _unitOfWork.CompleteAsync();

        return Ok(new { message = $"Successfully processed {toAdd.Count} inserts and {toUpdate.Count} updates." });
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/employee-attendance/summary/{employeeId}
    // ─────────────────────────────────────────────────────────────────────
    [HttpGet("summary/{employeeId}")]
    public async Task<IActionResult> GetMonthlySummary(Guid employeeId, [FromQuery] int year, [FromQuery] int month)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(employeeId);
        if (employee == null) return NotFound("Employee not found");

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var records = await _unitOfWork.Repository<EmployeeAttendance>().GetQueryable()
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == employeeId && a.AttendanceDate >= startDate && a.AttendanceDate <= endDate)
            .OrderBy(a => a.AttendanceDate)
            .ToListAsync();

        var summary = new MonthlyAttendanceSummaryDto
        {
            EmployeeId = employeeId,
            EmployeeCode = employee.EmployeeCode,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            Year = year,
            Month = month,
            TotalPresent = records.Count(r => r.Status == AttendanceStatus.Present),
            TotalAbsent = records.Count(r => r.Status == AttendanceStatus.Absent),
            TotalHalfDay = records.Count(r => r.Status == AttendanceStatus.HalfDay),
            TotalLate = records.Count(r => r.Status == AttendanceStatus.Late),
            TotalOnLeave = records.Count(r => r.Status == AttendanceStatus.OnLeave),
            TotalWorkingDays = records.Count, // Could be improved if holidays are tracked elsewhere
            DailyRecords = records.Select(MapToDto).ToList()
        };

        return Ok(summary);
    }

    private static EmployeeAttendanceDto MapToDto(EmployeeAttendance a)
    {
        return new EmployeeAttendanceDto
        {
            Id = a.Id,
            EmployeeId = a.EmployeeId,
            EmployeeCode = a.Employee?.EmployeeCode ?? string.Empty,
            EmployeeName = a.Employee != null ? $"{a.Employee.FirstName} {a.Employee.LastName}" : string.Empty,
            DepartmentName = a.Employee?.Department?.Name,
            DesignationName = a.Employee?.Designation?.Name,
            ProfilePhoto = a.Employee?.ProfilePhoto,
            AttendanceDate = a.AttendanceDate,
            Status = a.Status,
            InTime = a.InTime,
            OutTime = a.OutTime,
            Remarks = a.Remarks
        };
    }
}
