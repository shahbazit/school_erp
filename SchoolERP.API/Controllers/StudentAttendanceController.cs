using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Student;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudentAttendanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IOrganizationService _organizationService;

    public StudentAttendanceController(ApplicationDbContext context, IOrganizationService organizationService)
    {
        _context = context;
        _organizationService = organizationService;
    }

    [HttpGet("date/{date}/class/{classId}/section/{sectionId}")]
    public async Task<ActionResult<IEnumerable<StudentAttendanceDto>>> GetAttendanceByDate(DateTime date, Guid classId, Guid sectionId)
    {
        var orgId = _organizationService.GetOrganizationId();

        // Get all active students in this class + section from academic mapping
        var academics = await _context.StudentAcademics
            .Include(sa => sa.Student)
            .Where(sa => sa.ClassId == classId && sa.SectionId == sectionId && sa.IsCurrent && sa.Student.IsActive)
            .OrderBy(sa => sa.Student.FirstName)
            .ToListAsync();

        // Get existing attendance
        var existingAttendance = await _context.StudentAttendances
            .Where(a => a.ClassId == classId && a.SectionId == sectionId && a.AttendanceDate.Date == date.Date)
            .ToDictionaryAsync(a => a.StudentId);

        var result = academics.Select(sa =>
        {
            var student = sa.Student;
            var hasAttendance = existingAttendance.TryGetValue(student.Id, out var att);
            return new StudentAttendanceDto
            {
                StudentId = student.Id,
                StudentName = $"{student.FirstName} {student.LastName}",
                AdmissionNo = student.AdmissionNo,
                RollNumber = sa.RollNumber ?? string.Empty,
                Status = hasAttendance ? att!.Status : "Present", // defaults to present
                Remarks = hasAttendance ? att!.Remarks : string.Empty
            };
        }).ToList();

        return Ok(result);
    }

    [HttpPost("mark")]
    public async Task<IActionResult> MarkAttendance([FromBody] MarkStudentAttendanceRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();

        var existingRecords = await _context.StudentAttendances
            .Where(a => a.ClassId == request.ClassId && a.SectionId == request.SectionId && a.AttendanceDate.Date == request.AttendanceDate.Date)
            .ToListAsync();

        // Remove old records for the day for these students
        _context.StudentAttendances.RemoveRange(existingRecords);

        // Add new records
        var newRecords = request.Records.Select(r => new StudentAttendance
        {
            StudentId = r.StudentId,
            ClassId = request.ClassId,
            SectionId = request.SectionId,
            AttendanceDate = request.AttendanceDate.Date,
            Status = r.Status,
            Remarks = r.Remarks,
            OrganizationId = orgId
        });

        await _context.StudentAttendances.AddRangeAsync(newRecords);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet("summary/student/{studentId}/year/{year}/month/{month}")]
    public async Task<ActionResult<MonthlyStudentAttendanceSummaryDto>> GetMonthlySummary(Guid studentId, int year, int month)
    {
        var student = await _context.Students.FindAsync(studentId);
        if (student == null) return NotFound("Student not found.");

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var records = await _context.StudentAttendances
            .Where(a => a.StudentId == studentId && a.AttendanceDate >= startDate && a.AttendanceDate <= endDate)
            .OrderBy(a => a.AttendanceDate)
            .ToListAsync();

        var summary = new MonthlyStudentAttendanceSummaryDto
        {
            StudentId = student.Id,
            StudentName = $"{student.FirstName} {student.LastName}",
            AdmissionNo = student.AdmissionNo,
            TotalPresent = records.Count(r => r.Status == "Present"),
            TotalAbsent = records.Count(r => r.Status == "Absent"),
            TotalHalfDay = records.Count(r => r.Status == "HalfDay"),
            TotalLeave = records.Count(r => r.Status == "Leave"),
            DailyRecords = records.Select(r => new DailyStudentAttendanceDto
            {
                AttendanceDate = r.AttendanceDate,
                Status = r.Status
            }).ToList()
        };

        return Ok(summary);
    }
}
