using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;
using System.Security.Claims;
using System.Linq;
using SchoolERP.Domain.Enums;

namespace SchoolERP.API.Controllers;

[Route("api/dashboard")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IOrganizationService _organizationService;

    public DashboardController(ApplicationDbContext context, ICurrentUserService currentUserService, IOrganizationService organizationService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _organizationService = organizationService;
    }

    [HttpGet("admin/summary")]
    public async Task<IActionResult> GetAdminSummary()
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) 
        {
            Serilog.Log.Warning("GetAdminSummary: Unauthorized - OrgId is empty.");
            return Unauthorized();
        }

        // Validate organization existence (prevents 404 after DB reset)
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == orgId);
        if (!orgExists)
        {
            // Auto-repair for Admin: If the provided OrgId is invalid but the user is an admin,
            // find the first organization they belong to (assuming they belong to at least one)
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            if (string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                var firstOrg = await _context.Organizations.FirstOrDefaultAsync();
                if (firstOrg != null)
                {
                    orgId = firstOrg.Id;
                    Serilog.Log.Warning("GetAdminSummary: Provided OrgId invalid. Auto-repaired to {NewOrgId} for Admin.", orgId);
                }
                else
                {
                    Serilog.Log.Error("GetAdminSummary: NO ORGANIZATIONS FOUND in database.");
                    return NotFound(new { message = "Organization not found." });
                }
            }
            else
            {
                Serilog.Log.Error("GetAdminSummary: Organization {OrgId} NOT FOUND in database.", orgId);
                return NotFound(new { message = "Organization not found." });
            }
        }



        var today = DateTime.Today;
        var thisMonth = new DateTime(today.Year, today.Month, 1);
        var lastMonth = thisMonth.AddMonths(-1);

        // ---- Core Counts ----
        var totalStudents = await _context.Students.CountAsync();
        var totalTeachers = await _context.Employees.CountAsync(e => e.TeacherProfile != null);
        var totalEmployees = await _context.Employees.CountAsync();
        var activeTimetables = await _context.Timetables.CountAsync(t => t.IsActive);

        // ---- Fee Metrics ----
        var feeAccounts = await _context.StudentFeeAccounts
            .Select(a => new { a.TotalAllocated, a.TotalPaid, a.TotalDiscount })
            .ToListAsync();

        var totalAllocated = feeAccounts.Sum(a => a.TotalAllocated);
        var totalCollected = feeAccounts.Sum(a => a.TotalPaid);
        var totalPending = feeAccounts.Sum(a => a.TotalAllocated - a.TotalPaid - a.TotalDiscount);
        var studentsWithDues = await _context.StudentFeeAccounts
            .CountAsync(a => a.TotalAllocated - a.TotalPaid - a.TotalDiscount > 0);

        // This month fee collection
        var thisMonthCollection = await _context.FeeTransactions
            .Where(t => t.TransactionDate >= thisMonth && t.TransactionDate < thisMonth.AddMonths(1) && t.Amount > 0)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var lastMonthCollection = await _context.FeeTransactions
            .Where(t => t.TransactionDate >= lastMonth && t.TransactionDate < thisMonth && t.Amount > 0)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        // ---- Attendance (Today) ----
        var totalClassSections = await _context.Timetables.CountAsync(t => t.IsActive);
        var attendanceTakenToday = await _context.StudentAttendances
            .Where(a => a.AttendanceDate.Date == today)
            .Select(a => new { a.ClassId, a.SectionId })
            .Distinct()
            .CountAsync();

        // ---- Student gender breakdown ----
        int maleCount = 0, femaleCount = 0;
        try
        {
            var students = await _context.Students
                .Select(s => new { s.Gender })
                .ToListAsync();
            maleCount = students.Count(s => s.Gender != null && s.Gender.ToLower() == "male");
            femaleCount = students.Count(s => s.Gender != null && s.Gender.ToLower() == "female");
        }
        catch { }

        // ---- Recent Student Enrollments (last 5) ----
        var recentStudents = await _context.Students
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new {
                s.Id,
                s.FirstName,
                s.LastName,
                AdmissionNumber = s.AdmissionNo,
                s.CreatedAt,
                s.Gender
            })
            .ToListAsync();

        // ---- Recent Fee Transactions (last 5) ----
        var recentTransactions = await _context.FeeTransactions
            .Where(t => t.Amount > 0)
            .Include(t => t.Student)
            .OrderByDescending(t => t.TransactionDate)
            .Take(5)
            .Select(t => new {
                t.Id,
                t.Amount,
                t.TransactionDate,
                PaymentMode = t.PaymentMethod,
                StudentName = t.Student != null
                    ? t.Student.FirstName + " " + t.Student.LastName
                    : "N/A"
            })
            .ToListAsync();

        // ---- Leaves Pending ----
        int leavesPending = 0;
        try
        {
            leavesPending = await _context.LeaveApplications.CountAsync(l => l.Status == LeaveStatus.Pending);
        }
        catch { }

        // ---- Inventory low stock ----
        int lowStockItems = 0;
        try
        {
            lowStockItems = await _context.InventoryItems.CountAsync(i => i.CurrentStock <= i.MinQuantity);
        }
        catch { }

        // ---- Exams (upcoming) ----
        int upcomingExams = 0;
        try
        {
            upcomingExams = await _context.Exams.CountAsync(e => e.StartDate >= today);
        }
        catch { }

        // ---- Monthly collection trend (last 6 months) ----
        var monthlyTrend = new List<object>();
        for (int i = 5; i >= 0; i--)
        {
            var mStart = new DateTime(today.Year, today.Month, 1).AddMonths(-i);
            var mEnd = mStart.AddMonths(1);
            var amount = await _context.FeeTransactions
                .Where(t => t.TransactionDate >= mStart && t.TransactionDate < mEnd && t.Amount > 0)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;
            monthlyTrend.Add(new { month = mStart.ToString("MMM"), amount });
        }

        return Ok(new
        {
            // Core
            totalStudents,
            totalTeachers,
            totalEmployees,
            activeTimetables,
            maleCount,
            femaleCount,

            // Fees
            totalAllocated,
            totalCollected,
            totalPending,
            studentsWithDues,
            thisMonthCollection,
            lastMonthCollection,
            collectionGrowth = lastMonthCollection > 0
                ? Math.Round((double)(thisMonthCollection - lastMonthCollection) / (double)lastMonthCollection * 100, 1)
                : 0,

            // Attendance
            attendanceTakenToday,
            totalClassSections,

            // Operations
            leavesPending,
            lowStockItems,
            upcomingExams,

            // Recent Activity
            recentStudents,
            recentTransactions,

            // Trends
            monthlyTrend
        });
    }

    [HttpGet("teacher/summary")]
    [Authorize(Roles = "Teacher,Admin,Staff")]
    public async Task<IActionResult> GetTeacherSummary([FromQuery] Guid? employeeId)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return Unauthorized();

        // Validate organization existence
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == orgId);
        if (!orgExists)
        {
            var firstOrg = await _context.Organizations.FirstOrDefaultAsync();
            if (firstOrg != null)
            {
                orgId = firstOrg.Id;
                Serilog.Log.Warning("GetTeacherSummary: Provided OrgId invalid. Auto-repaired to {NewOrgId}", orgId);
            }
            else
            {
                return NotFound(new { message = "Organization not found." });
            }
        }

        var userId = _currentUserService.UserId;

        Employee? employee;

        if (employeeId.HasValue)
        {
            employee = await _context.Employees
                .Include(e => e.TeacherProfile)
                .FirstOrDefaultAsync(e => e.Id == employeeId.Value);
        }
        else
        {
            employee = await _context.Employees
                .Include(e => e.TeacherProfile)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        if (employee == null) 
        {
             Serilog.Log.Warning("GetTeacherSummary: Profile not found for User={UserId} or EmployeeParam={EmployeeId}", userId, employeeId);
             return NotFound(new { message = "Teacher profile not found for this user link." });
        }

        var today = DateTime.Today;
        var dayOfWeek = (int)today.DayOfWeek;

        var periods = await _context.TimetableDetails
            .Include(p => p.Timetable)
                .ThenInclude(t => t!.Class)
            .Include(p => p.Timetable)
                .ThenInclude(t => t!.Section)
            .Include(p => p.Subject)
            .Where(p => p.TeacherId == employee.Id && p.DayOfWeek == (DayOfWeek)dayOfWeek && p.Timetable!.IsActive && p.IsActive)
            .ToListAsync();

        var classSections = periods
            .Where(p => !p.IsBreak)
            .Select(p => new { p.Timetable!.ClassId, p.Timetable!.SectionId })
            .Distinct()
            .ToList();

        int attendanceDoneCount = 0;
        foreach (var cs in classSections)
        {
             if (await _context.StudentAttendances.AnyAsync(a => a.ClassId == cs.ClassId && a.SectionId == cs.SectionId && a.AttendanceDate.Date == today))
             {
                 attendanceDoneCount++;
             }
        }

        int homeworkGivenCount = 0;
        foreach (var p in periods.Where(p => !p.IsBreak))
        {
            if (await _context.Homeworks.AnyAsync(h => h.ClassId == p.Timetable!.ClassId && h.SectionId == p.Timetable!.SectionId && h.SubjectId == p.SubjectId && h.AssignDate.Date == today))
            {
                homeworkGivenCount++;
            }
        }

        return Ok(new
        {
            periodsToday = periods.Count(p => !p.IsBreak),
            attendancePending = classSections.Count - attendanceDoneCount,
            homeworkPending = periods.Count(p => !p.IsBreak) - homeworkGivenCount,
            totalStudents = await _context.Students.CountAsync(),
            nextPeriod = periods.Where(p => !p.IsBreak).OrderBy(p => p.StartTime).FirstOrDefault(p => p.StartTime > DateTime.Now.TimeOfDay)
        });
    }
}
