namespace SchoolERP.Application.DTOs.Student;

public class StudentDocumentDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
