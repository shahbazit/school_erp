using SchoolERP.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolERP.Domain.Entities;

public class Homework : BaseEntity
{
    public Guid ClassId { get; set; }
    public Guid SectionId { get; set; }
    public Guid SubjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime AssignDate { get; set; } = DateTime.Today;
    public DateTime SubmissionDate { get; set; } = DateTime.Today;
    public string? AttachmentUrl { get; set; }
    public bool IsActive { get; set; } = true;

    [ForeignKey("ClassId")]
    public virtual AcademicClass Class { get; set; } = null!;
    [ForeignKey("SectionId")]
    public virtual AcademicSection Section { get; set; } = null!;
    [ForeignKey("SubjectId")]
    public virtual Subject Subject { get; set; } = null!;
}
