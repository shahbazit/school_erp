using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LibraryCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<LibraryBook> Books { get; set; } = new List<LibraryBook>();
}
