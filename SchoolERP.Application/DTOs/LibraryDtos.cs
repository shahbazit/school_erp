namespace SchoolERP.Application.DTOs;

public class LibraryCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class LibraryBookDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Author { get; set; }
    public string? Publisher { get; set; }
    public string? Edition { get; set; }
    public string? ISBN { get; set; }
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public string? Location { get; set; }
    public decimal? Price { get; set; }
}

public class LibraryBookIssueDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public string? BookTitle { get; set; }
    public Guid? StudentId { get; set; }
    public string? StudentName { get; set; }
    public string? AdmissionNumber { get; set; }
    public Guid? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? EmployeeCode { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public decimal FineAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
}
