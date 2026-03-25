using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;
using System.Security.Claims;
using System.Linq;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DashboardController(ApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet("admin/summary")]
    public async Task<IActionResult> GetAdminSummary()
    {
        return Ok(new
        {
            totalStudents = await _context.Students.CountAsync(),
            totalTeachers = await _context.Employees.CountAsync(e => e.TeacherProfile != null),
            activeTimetables = await _context.Timetables.CountAsync(t => t.IsActive),
            pendingFeesCount = await _context.StudentFeeAccounts.CountAsync(a => a.TotalAllocated - a.TotalPaid - a.TotalDiscount > 0)
        });
    }

    [HttpGet("teacher/summary")]
    public async Task<IActionResult> GetTeacherSummary(Guid? employeeId)
    {
        var userId = _currentUserService.UserId;
        Employee? employee;

        if (employeeId.HasValue)
        {
            // Allow admin to see any teacher's summary
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

        if (employee == null) return NotFound("Teacher profile not found");

        var today = DateTime.Today;
        var dayOfWeek = (int)today.DayOfWeek;

        // 1. Get Today's Classes for this teacher from Timetable
        var periods = await _context.TimetableDetails
            .Include(p => p.Timetable)
                .ThenInclude(t => t!.Class)
            .Include(p => p.Timetable)
                .ThenInclude(t => t!.Section)
            .Include(p => p.Subject)
            .Where(p => p.TeacherId == employee.Id && p.DayOfWeek == (DayOfWeek)dayOfWeek && p.Timetable!.IsActive && p.IsActive)
            .ToListAsync();

        // 2. Attendance Status (Taken or NOT)
        // Group periods by Class and Section to see if attendance was recorded for them today
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

        // 3. Homework Status
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
            totalStudents = await _context.Students.CountAsync(), // Simple metric
            nextPeriod = periods.Where(p => !p.IsBreak).OrderBy(p => p.StartTime).FirstOrDefault(p => p.StartTime > DateTime.Now.TimeOfDay)
        });
    }
}
