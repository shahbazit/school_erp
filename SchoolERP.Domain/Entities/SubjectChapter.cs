using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class SubjectChapter : BaseEntity
{
    public Guid SubjectBookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
    public string? Summary { get; set; } // AI Generated summary

    // Navigation properties
    public virtual SubjectBook? SubjectBook { get; set; }
    public virtual ICollection<ChapterContent> Contents { get; set; } = new List<ChapterContent>();
}
