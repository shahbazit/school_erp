using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Timetable;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TimetableController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TimetableController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimetableDto>>> GetTimetables(Guid? classId, Guid? sectionId, Guid? academicYearId, bool onlyActive = true)
    {
        var currentOrgId = _context.CurrentOrganizationId;
        var query = _context.Timetables
            .IgnoreQueryFilters()
            .Where(t => t.OrganizationId == currentOrgId || t.OrganizationId == Guid.Empty)
            .Include(t => t.AcademicYear)
            .Include(t => t.Class)
            .Include(t => t.Section)
            .AsQueryable();

        if (onlyActive) query = query.Where(t => t.IsActive);
        if (classId.HasValue) query = query.Where(t => t.ClassId == classId.Value);
        if (sectionId.HasValue) query = query.Where(t => t.SectionId == sectionId.Value);
        if (academicYearId.HasValue) query = query.Where(t => t.AcademicYearId == academicYearId.Value);

        var result = await query.Select(t => new TimetableDto
        {
            Id = t.Id,
            AcademicYearId = t.AcademicYearId,
            AcademicYearName = t.AcademicYear != null ? t.AcademicYear.Name : "",
            ClassId = t.ClassId,
            ClassName = t.Class != null ? t.Class.Name : "",
            SectionId = t.SectionId,
            SectionName = t.Section != null ? t.Section.Name : "",
            Name = t.Name,
            IsActive = t.IsActive
        }).ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TimetableDto>> GetTimetable(Guid id)
    {
        var currentOrgId = _context.CurrentOrganizationId;
        var t = await _context.Timetables
            .IgnoreQueryFilters()
            .Include(t => t.Periods.Where(p => p.IsActive))
                .ThenInclude(p => p.Subject)
            .Include(t => t.Periods.Where(p => p.IsActive))
                .ThenInclude(p => p.Teacher)
            .Include(t => t.AcademicYear)
            .Include(t => t.Class)
            .Include(t => t.Section)
            .FirstOrDefaultAsync(t => t.Id == id && (t.OrganizationId == currentOrgId || t.OrganizationId == Guid.Empty));

        if (t == null) return NotFound();

        return Ok(MapToDetailedDto(t));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTimetableDto dto)
    {
        var timetable = new Timetable
        {
            AcademicYearId = dto.AcademicYearId,
            ClassId = dto.ClassId,
            SectionId = dto.SectionId,
            Name = dto.Name,
            IsActive = true
        };

        foreach (var p in dto.Periods)
        {
            timetable.Periods.Add(new TimetableDetail
            {
                DayOfWeek = p.DayOfWeek,
                PeriodNumber = p.PeriodNumber,
                StartTime = TimeSpan.Parse(p.StartTime),
                EndTime = TimeSpan.Parse(p.EndTime),
                SubjectId = p.SubjectId,
                TeacherId = p.TeacherId,
                IsBreak = p.IsBreak,
                Remarks = p.Remarks
            });
        }

        _context.Timetables.Add(timetable);
        await _context.SaveChangesAsync();
        return Ok(timetable.Id);
    }

    [HttpPost("{id}/update")]
    public async Task<IActionResult> Update(Guid id, CreateTimetableDto dto)
    {
        var currentOrgId = _context.CurrentOrganizationId;
        var timetable = await _context.Timetables
            .IgnoreQueryFilters()
            .Include(t => t.Periods)
            .FirstOrDefaultAsync(t => t.Id == id && (t.OrganizationId == currentOrgId || t.OrganizationId == Guid.Empty));

        if (timetable == null) return NotFound();

        _context.IgnoreTenant = true;
        Serilog.Log.Information("Atomic Update started for timetable {Id}. Received {Count} periods.", id, dto.Periods.Count);
        
        try {
            // STEP 1: REMOVE existing periods (Separate Save)
            if (timetable.Periods.Any()) {
                Serilog.Log.Information("Stage 1: Removing {Count} existing periods for {Id}", timetable.Periods.Count, id);
                _context.TimetableDetails.RemoveRange(timetable.Periods);
                await _context.SaveChangesAsync();
                Serilog.Log.Information("Stage 1 complete: Existing periods purged.");
            }

            // STEP 2: UPDATE Parent Props
            timetable.AcademicYearId = dto.AcademicYearId;
            timetable.ClassId = dto.ClassId;
            timetable.SectionId = dto.SectionId;
            timetable.Name = dto.Name;
            timetable.IsActive = dto.IsActive;

            // STEP 3: ADD NEW Periods (Explicitly marked as added to context)
            foreach (var p in dto.Periods)
            {
                if (string.IsNullOrWhiteSpace(p.StartTime) || string.IsNullOrWhiteSpace(p.EndTime)) continue;

                var newP = new TimetableDetail
                {
                    Id = Guid.NewGuid(),
                    TimetableId = id, 
                    DayOfWeek = (DayOfWeek)p.DayOfWeek,
                    PeriodNumber = p.PeriodNumber,
                    StartTime = TimeSpan.Parse(p.StartTime),
                    EndTime = TimeSpan.Parse(p.EndTime),
                    SubjectId = p.SubjectId,
                    TeacherId = p.TeacherId,
                    IsBreak = p.IsBreak,
                    Remarks = p.Remarks
                };
                
                _context.TimetableDetails.Add(newP);
            }

            Serilog.Log.Information("Stage 2: Commit Additions/Updates for {Id}...", id);
            await _context.SaveChangesAsync();
            Serilog.Log.Information("Timetable {Id} updated successfully.", id);
        } catch (Exception ex) {
            Serilog.Log.Error(ex, "Failed to update timetable {Id}. Inner: {Inner}", id, ex.InnerException?.Message);
            return StatusCode(500, new { message = "Update failed", details = ex.Message, inner = ex.InnerException?.Message });
        } finally {
            _context.IgnoreTenant = false;
        }

        return NoContent();
    }

    [HttpPost("{id}/delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var currentOrgId = _context.CurrentOrganizationId;
        var timetable = await _context.Timetables
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == id && (t.OrganizationId == currentOrgId || t.OrganizationId == Guid.Empty));

        if (timetable == null) return NotFound();

        _context.IgnoreTenant = true;
        try {
            _context.Timetables.Remove(timetable);
            await _context.SaveChangesAsync();
        } finally {
            _context.IgnoreTenant = false;
        }

        return NoContent();
    }

    [HttpGet("teacher/{employeeId}")]
    public async Task<ActionResult<IEnumerable<TimetableDetailDto>>> GetTeacherSchedule(Guid employeeId, Guid? academicYearId)
    {
        var query = _context.TimetableDetails
            .Include(p => p.Timetable)
                .ThenInclude(t => t!.Class)
            .Include(p => p.Timetable)
                .ThenInclude(t => t!.Section)
            .Include(p => p.Subject)
            .Where(p => p.TeacherId == employeeId && p.IsActive && p.Timetable!.IsActive);

        if (academicYearId.HasValue)
            query = query.Where(p => p.Timetable!.AcademicYearId == academicYearId.Value);

        var result = await query.Select(p => new TimetableDetailDto
        {
            Id = p.Id,
            DayOfWeek = p.DayOfWeek,
            PeriodNumber = p.PeriodNumber,
            StartTime = p.StartTime.ToString(@"hh\:mm"),
            EndTime = p.EndTime.ToString(@"hh\:mm"),
            SubjectId = p.SubjectId,
            SubjectName = p.Subject != null ? p.Subject.Name : "Break",
            SubjectCode = p.Subject != null ? p.Subject.Code : "",
            TeacherId = p.TeacherId,
            TeacherName = p.Teacher != null ? p.Teacher.FirstName + " " + p.Teacher.LastName : "",
            Remarks = (p.Timetable != null && p.Timetable.Class != null ? p.Timetable.Class.Name : "") 
                      + " - " + 
                      (p.Timetable != null && p.Timetable.Section != null ? p.Timetable.Section.Name : "")
        }).ToListAsync();

        return Ok(result);
    }

    private TimetableDto MapToDetailedDto(Timetable t)
    {
        return new TimetableDto
        {
            Id = t.Id,
            AcademicYearId = t.AcademicYearId,
            AcademicYearName = t.AcademicYear?.Name ?? "",
            ClassId = t.ClassId,
            ClassName = t.Class?.Name ?? "",
            SectionId = t.SectionId,
            SectionName = t.Section?.Name ?? "",
            Name = t.Name,
            IsActive = t.IsActive,
            Periods = t.Periods.Select(p => new TimetableDetailDto
            {
                Id = p.Id,
                DayOfWeek = p.DayOfWeek,
                PeriodNumber = p.PeriodNumber,
                StartTime = p.StartTime.ToString(@"hh\:mm"),
                EndTime = p.EndTime.ToString(@"hh\:mm"),
                SubjectId = p.SubjectId,
                SubjectName = p.Subject?.Name,
                SubjectCode = p.Subject?.Code,
                TeacherId = p.TeacherId,
                TeacherName = p.Teacher != null ? p.Teacher.FirstName + " " + p.Teacher.LastName : null,
                TeacherCode = p.Teacher?.EmployeeCode,
                IsBreak = p.IsBreak,
                Remarks = p.Remarks
            }).OrderBy(p => p.DayOfWeek).ThenBy(p => p.PeriodNumber).ToList()
        };
    }
}
