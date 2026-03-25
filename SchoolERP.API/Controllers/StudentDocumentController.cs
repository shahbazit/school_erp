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
public class StudentDocumentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IFileService _fileService;
    private readonly IOrganizationService _organizationService;

    public StudentDocumentController(
        ApplicationDbContext context, 
        IFileService fileService,
        IOrganizationService organizationService)
    {
        _context = context;
        _fileService = fileService;
        _organizationService = organizationService;
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IEnumerable<StudentDocumentDto>>> GetStudentDocuments(Guid studentId)
    {
        var documents = await _context.StudentDocuments
            .Where(d => d.StudentId == studentId)
            .Select(d => new StudentDocumentDto
            {
                Id = d.Id,
                StudentId = d.StudentId,
                DocumentName = d.DocumentName,
                DocumentType = d.DocumentType,
                DocumentUrl = d.DocumentUrl,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();

        return Ok(documents);
    }

    [HttpPost]
    public async Task<ActionResult<StudentDocumentDto>> UploadDocument([FromForm] CreateStudentDocumentDto dto)
    {
        var student = await _context.Students.FindAsync(dto.StudentId);
        if (student == null)
            return NotFound("Student not found.");

        if (dto.File == null || dto.File.Length == 0)
            return BadRequest("File is required.");

        var fileUrl = await _fileService.UploadFileAsync(dto.File, "student-documents");

        var document = new StudentDocument
        {
            StudentId = dto.StudentId,
            DocumentType = dto.DocumentType,
            DocumentName = dto.DocumentName,
            DocumentUrl = fileUrl,
            OrganizationId = _organizationService.GetOrganizationId()
        };

        _context.StudentDocuments.Add(document);
        await _context.SaveChangesAsync();

        return Ok(new StudentDocumentDto
        {
            Id = document.Id,
            StudentId = document.StudentId,
            DocumentType = document.DocumentType,
            DocumentName = document.DocumentName,
            DocumentUrl = document.DocumentUrl,
            CreatedAt = document.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var document = await _context.StudentDocuments.FindAsync(id);
        if (document == null) return NotFound();

        _fileService.DeleteFile(document.DocumentUrl);
        _context.StudentDocuments.Remove(document);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
