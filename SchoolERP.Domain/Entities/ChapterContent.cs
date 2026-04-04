using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class ChapterContent : BaseEntity
{
    public Guid ChapterId { get; set; }
    public ContentType ContentType { get; set; }
    public string ContentValue { get; set; } = string.Empty; // Text content or File Path
    public int OrderIndex { get; set; }
    public int? PageNumber { get; set; }
    
    // Optional Vector Data for advanced search
    public string? VectorEmbedding { get; set; } // JSON serialized float array or specific vector format

    // Navigation property
    public virtual SubjectChapter? Chapter { get; set; }
}

public enum ContentType
{
    Text = 1,
    Image = 2,
    Pdf = 3,
    Video = 4
}
