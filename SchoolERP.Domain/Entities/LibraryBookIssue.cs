using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public enum LibraryIssueStatus
{
    Issued,
    Returned,
    Lost,
    Damaged
}

public class LibraryBookIssue : BaseEntity
{
    public Guid BookId { get; set; }
    public Guid? StudentId { get; set; }
    public Guid? EmployeeId { get; set; }
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public decimal FineAmount { get; set; } = 0;
    public LibraryIssueStatus Status { get; set; } = LibraryIssueStatus.Issued;
    public string? Remarks { get; set; }

    // Navigation properties
    public virtual LibraryBook Book { get; set; } = null!;
    public virtual Student? Student { get; set; }
    public virtual Employee? Employee { get; set; }
}
