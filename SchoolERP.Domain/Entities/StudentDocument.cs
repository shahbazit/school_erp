using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentDocument : BaseEntity
{
    public Guid StudentId { get; set; }
    public string DocumentType { get; set; } = string.Empty; // Aadhar, TC, BirthCertificate, etc.
    public string DocumentName { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    
    public virtual Student Student { get; set; } = null!;
}
