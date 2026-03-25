using SchoolERP.Domain.Common;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Domain.Entities;

public class EmployeeDocument : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DocumentType DocumentType { get; set; } = DocumentType.Other;
    public string? Description { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual Employee? Employee { get; set; }
}
