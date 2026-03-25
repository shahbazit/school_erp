using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SchoolERP.Application.DTOs.Student;

public class CreateStudentDocumentDto
{
    [Required]
    public Guid StudentId { get; set; }
    
    [Required]
    public string DocumentType { get; set; } = string.Empty;
    
    [Required]
    public string DocumentName { get; set; } = string.Empty;

    [Required]
    public IFormFile File { get; set; } = null!;
}
