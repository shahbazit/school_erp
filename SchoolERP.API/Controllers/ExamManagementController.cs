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
public class ExamManagementController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IOrganizationService _organizationService;

    public ExamManagementController(ApplicationDbContext context, IOrganizationService organizationService)
    {
        _context = context;
        _organizationService = organizationService;
    }

    [HttpGet("exams")]
    public async Task<ActionResult<IEnumerable<ExamDto>>> GetAllExams()
    {
        var exams = await _context.Exams
            .OrderByDescending(e => e.StartDate)
            .Select(e => new ExamDto
            {
                Id = e.Id,
                ExamName = e.ExamName,
                AcademicYear = e.AcademicYear,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                Status = e.Status
            })
            .ToListAsync();
        
        return Ok(exams);
    }

    [HttpPost("exams")]
    public async Task<IActionResult> CreateExam([FromBody] CreateExamDto dto)
    {
        var exam = new Exam
        {
            ExamName = dto.ExamName,
            AcademicYear = dto.AcademicYear,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = dto.Status,
            OrganizationId = _organizationService.GetOrganizationId()
        };
        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpGet("results/exam/{examId}/class/{classId}/section/{sectionId}/subject/{subjectId}")]
    public async Task<ActionResult<IEnumerable<StudentExamResultDto>>> GetMarkEntrySheet(Guid examId, Guid classId, Guid sectionId, Guid subjectId)
    {
        var students = await _context.StudentAcademics
            .Include(sa => sa.Student)
            .Where(sa => sa.ClassId == classId && sa.SectionId == sectionId && sa.IsCurrent && sa.Student.IsActive)
            .OrderBy(sa => sa.Student.FirstName)
            .Select(sa => sa.Student)
            .ToListAsync();

        var existingMarks = await _context.StudentExamResults
            .Where(r => r.ExamId == examId && r.SubjectId == subjectId && students.Select(s => s.Id).Contains(r.StudentId))
            .ToDictionaryAsync(r => r.StudentId);

        var subject = await _context.Subjects.FindAsync(subjectId);
        var subjectName = subject?.Name ?? "Unknown";

        var result = students.Select(s =>
        {
            var hasMarks = existingMarks.TryGetValue(s.Id, out var marks);
            return new StudentExamResultDto
            {
                Id = hasMarks ? marks!.Id : Guid.Empty,
                ExamId = examId,
                StudentId = s.Id,
                StudentName = $"{s.FirstName} {s.LastName}",
                AdmissionNo = s.AdmissionNo,
                SubjectId = subjectId,
                SubjectName = subjectName,
                TotalMarks = hasMarks ? marks!.TotalMarks : 100M,
                PassingMarks = hasMarks ? marks!.PassingMarks : 33M,
                ObtainedMarks = hasMarks ? marks!.ObtainedMarks : 0M,
                Grade = hasMarks ? marks!.Grade : "",
                Remarks = hasMarks ? marks!.Remarks : ""
            };
        });

        return Ok(result);
    }

    [HttpPost("results/mark")]
    public async Task<IActionResult> SubmitMarkSheet([FromBody] MarkEntryRequestDto sheet)
    {
        var orgId = _organizationService.GetOrganizationId();
        
        var studentIds = sheet.Records.Select(r => r.StudentId).ToList();
        
        var existingMarks = await _context.StudentExamResults
            .Where(r => r.ExamId == sheet.ExamId && r.SubjectId == sheet.SubjectId && studentIds.Contains(r.StudentId))
            .ToListAsync();

        _context.StudentExamResults.RemoveRange(existingMarks);

        var newMarks = sheet.Records.Select(r => new StudentExamResult
        {
            ExamId = sheet.ExamId,
            StudentId = r.StudentId,
            SubjectId = sheet.SubjectId,
            TotalMarks = sheet.TargetTotalMarks,
            PassingMarks = sheet.TargetPassingMarks,
            ObtainedMarks = r.ObtainedMarks,
            Grade = r.Grade,
            Remarks = r.Remarks,
            OrganizationId = orgId
        });

        await _context.StudentExamResults.AddRangeAsync(newMarks);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet("results/marksheet/student/{studentId}")]
    public async Task<ActionResult<IEnumerable<dynamic>>> GetStudentMarksheet(Guid studentId)
    {
        var results = await _context.StudentExamResults
            .Include(r => r.Exam)
            .Include(r => r.Subject)
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.Exam.StartDate)
            .Select(r => new {
                ExamName = r.Exam.ExamName,
                ExamId = r.ExamId,
                AcademicYear = r.Exam.AcademicYear,
                SubjectName = r.Subject.Name,
                SubjectCode = r.Subject.Code,
                TotalMarks = r.TotalMarks,
                PassingMarks = r.PassingMarks,
                ObtainedMarks = r.ObtainedMarks,
                Grade = r.Grade,
                Remarks = r.Remarks
            })
            .ToListAsync();

        return Ok(results);
    }
}
