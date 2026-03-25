using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Employee;

public class EmployeeDocumentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DocumentType DocumentType { get; set; }
    public string DocumentTypeName => DocumentType.ToString();
    public string? Description { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class AddDocumentDto
{
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DocumentType DocumentType { get; set; } = DocumentType.Other;
    public string? Description { get; set; }
    public long FileSizeBytes { get; set; }
}
