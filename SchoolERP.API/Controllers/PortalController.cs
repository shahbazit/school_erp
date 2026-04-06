using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;
using System.Security.Claims;

namespace SchoolERP.API.Controllers;

[Route("api/portal")]
[ApiController]
[Authorize]
public class PortalController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IOrganizationService _organizationService;

    public PortalController(ApplicationDbContext context, ICurrentUserService currentUserService, IOrganizationService organizationService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _organizationService = organizationService;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetLinkedStudents()
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return Unauthorized();

        var userId = _currentUserService.UserId;
        var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound();

        var identifier = (user.Email ?? "").Trim();
        var mobile = (user.MobileNumber ?? "").Trim();

        var students = await _context.Students
            .Include(s => s.AcademicRecords)
                .ThenInclude(a => a.Class)
            .Include(s => s.AcademicRecords)
                .ThenInclude(a => a.Section)
            .IgnoreQueryFilters()
            .Where(s => s.OrganizationId == orgId && (
                (!string.IsNullOrEmpty(identifier) && s.MobileNumber == identifier) || 
                (!string.IsNullOrEmpty(mobile) && s.MobileNumber == mobile) ||
                (!string.IsNullOrEmpty(identifier) && s.Email == identifier) || 
                (!string.IsNullOrEmpty(mobile) && s.Email == mobile) ||
                (!string.IsNullOrEmpty(mobile) && s.FatherMobile == mobile) || 
                (!string.IsNullOrEmpty(identifier) && s.FatherMobile == identifier) ||
                (!string.IsNullOrEmpty(mobile) && s.MotherMobile == mobile) || 
                (!string.IsNullOrEmpty(identifier) && s.MotherMobile == identifier) ||
                (!string.IsNullOrEmpty(mobile) && s.GuardianMobile == mobile) || 
                (!string.IsNullOrEmpty(identifier) && s.GuardianMobile == identifier) ||
                (!string.IsNullOrEmpty(identifier) && s.FatherEmail == identifier) || 
                (!string.IsNullOrEmpty(identifier) && s.MotherEmail == identifier) || 
                (!string.IsNullOrEmpty(identifier) && s.GuardianEmail == identifier) ||
                (!string.IsNullOrEmpty(identifier) && s.AdmissionNo == identifier)))
             .Select(s => new {
                 s.Id,
                 s.FirstName,
                 s.LastName,
                 s.AdmissionNo,
                 s.StudentPhoto,
                 s.Gender,
                 s.DateOfBirth,
                 Class = s.AcademicRecords.Where(a => a.IsCurrent).Select(a => a.Class.Name).FirstOrDefault() ?? "N/A",
                 Section = s.AcademicRecords.Where(a => a.IsCurrent).Select(a => a.Section != null ? a.Section.Name : null).FirstOrDefault() ?? "N/A",
                 ClassId = s.AcademicRecords.Where(a => a.IsCurrent).Select(a => (Guid?)a.ClassId).FirstOrDefault() ?? Guid.Empty,
                 SectionId = s.AcademicRecords.Where(a => a.IsCurrent).Select(a => a.SectionId).FirstOrDefault(),
                 AcademicYear = s.AcademicRecords.Where(a => a.IsCurrent).Select(a => a.AcademicYear).FirstOrDefault(),
                 RollNumber = s.AcademicRecords.Where(a => a.IsCurrent).Select(a => a.RollNumber).FirstOrDefault()
             })
            .ToListAsync();

        return Ok(students);
    }

    [HttpGet("student/{id}/summary")]
    public async Task<IActionResult> GetStudentSummary(Guid id)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return Unauthorized();

        if (!await IsStudentLinkedToUser(id)) return Forbidden("Unauthorized student access.");

        var student = await _context.Students
            .Include(s => s.AcademicRecords)
                .ThenInclude(a => a.Class)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id);
        
        if (student == null) return NotFound();

        var feeAccount = await _context.StudentFeeAccounts.FirstOrDefaultAsync(f => f.StudentId == id);
        var today = DateTime.Today;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var attendanceRecords = await _context.StudentAttendances
            .Where(a => a.StudentId == id && a.AttendanceDate >= startOfMonth)
            .ToListAsync();

        var currentRecord = student.AcademicRecords.FirstOrDefault(a => a.IsCurrent);
        var homeworkCount = currentRecord != null 
            ? await _context.Homeworks.CountAsync(h => h.ClassId == currentRecord.ClassId && h.AssignDate.Date == today)
            : 0;

        return Ok(new
        {
            studentName = $"{student.FirstName} {student.LastName}",
            admissionNo = student.AdmissionNo,
            className = currentRecord?.Class?.Name ?? "N/A",
            outstandingFees = feeAccount?.CurrentBalance ?? 0,
            paidFees = feeAccount?.TotalPaid ?? 0,
            attendancePresentThisMonth = attendanceRecords.Count(a => a.Status == "Present"),
            attendanceTotalThisMonth = attendanceRecords.Count,
            homeworkToday = homeworkCount,
            lastTransactionDate = feeAccount?.LastTransactionDate
        });
    }

    [HttpGet("student/{id}/attendance")]
    public async Task<IActionResult> GetStudentAttendance(Guid id, [FromQuery] int month, [FromQuery] int year)
    {
        if (!await IsStudentLinkedToUser(id)) return Forbidden("Unauthorized student access.");
        
        var records = await _context.StudentAttendances
            .Where(a => a.StudentId == id && a.AttendanceDate.Month == month && a.AttendanceDate.Year == year)
            .OrderByDescending(a => a.AttendanceDate)
            .Select(a => new { a.AttendanceDate, a.Status, a.Remarks })
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("student/{id}/fees")]
    public async Task<IActionResult> GetStudentFees(Guid id)
    {
        if (!await IsStudentLinkedToUser(id)) return Forbidden("Unauthorized student access.");
        
        var transactions = await _context.FeeTransactions
            .Where(t => t.StudentId == id)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new { t.TransactionDate, t.Amount, t.PaymentMethod, Status = t.Type, Note = t.Description })
            .ToListAsync();

        var dues = await _context.StudentFeeAccounts.FirstOrDefaultAsync(f => f.StudentId == id);

        return Ok(new {
            transactions,
            summary = new {
                totalAllocated = dues?.TotalAllocated ?? 0,
                totalPaid = dues?.TotalPaid ?? 0,
                totalDiscount = dues?.TotalDiscount ?? 0,
                balance = dues?.CurrentBalance ?? 0
            }
        });
    }

    private async Task<bool> IsStudentLinkedToUser(Guid studentId)
    {
        var orgId = _organizationService.GetOrganizationId();
        var userId = _currentUserService.UserId;
        var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return false;

        var identifier = (user.Email ?? "").Trim();
        var mobile = (user.MobileNumber ?? "").Trim();

        return await _context.Students.IgnoreQueryFilters().AnyAsync(s => s.Id == studentId && s.OrganizationId == orgId && (
            (!string.IsNullOrEmpty(identifier) && s.MobileNumber == identifier) || 
            (!string.IsNullOrEmpty(mobile) && s.MobileNumber == mobile) ||
            (!string.IsNullOrEmpty(identifier) && s.Email == identifier) || 
            (!string.IsNullOrEmpty(mobile) && s.Email == mobile) ||
            (!string.IsNullOrEmpty(mobile) && s.FatherMobile == mobile) || 
            (!string.IsNullOrEmpty(identifier) && s.FatherMobile == identifier) ||
            (!string.IsNullOrEmpty(mobile) && s.MotherMobile == mobile) || 
            (!string.IsNullOrEmpty(identifier) && s.MotherMobile == identifier) ||
            (!string.IsNullOrEmpty(mobile) && s.GuardianMobile == mobile) || 
            (!string.IsNullOrEmpty(identifier) && s.GuardianMobile == identifier) ||
            (!string.IsNullOrEmpty(identifier) && s.FatherEmail == identifier) || 
            (!string.IsNullOrEmpty(identifier) && s.MotherEmail == identifier) || 
            (!string.IsNullOrEmpty(identifier) && s.GuardianEmail == identifier) ||
            (!string.IsNullOrEmpty(identifier) && s.AdmissionNo == identifier)));
    }

    private IActionResult Forbidden(string message)
    {
        return BadRequest(new { message });
    }
}
