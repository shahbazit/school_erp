using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LibraryBook : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Author { get; set; }
    public string? Publisher { get; set; }
    public string? Edition { get; set; }
    public string? ISBN { get; set; }
    public Guid CategoryId { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public string? Location { get; set; } // Rack/Shelf
    public decimal? Price { get; set; }

    // Navigation properties
    public virtual LibraryCategory Category { get; set; } = null!;
    public virtual ICollection<LibraryBookIssue> Issues { get; set; } = new List<LibraryBookIssue>();
}
