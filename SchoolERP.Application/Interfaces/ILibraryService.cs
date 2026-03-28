using SchoolERP.Domain.Entities;

namespace SchoolERP.Application.Interfaces;

public interface ILibraryService
{
    // Categories
    Task<IEnumerable<LibraryCategory>> GetCategoriesAsync();
    Task<LibraryCategory?> GetCategoryByIdAsync(Guid id);
    Task<LibraryCategory> CreateCategoryAsync(LibraryCategory category);
    Task UpdateCategoryAsync(LibraryCategory category);
    Task DeleteCategoryAsync(Guid id);

    // Books
    Task<IEnumerable<LibraryBook>> GetBooksAsync();
    Task<LibraryBook?> GetBookByIdAsync(Guid id);
    Task<LibraryBook> CreateBookAsync(LibraryBook book);
    Task UpdateBookAsync(LibraryBook book);
    Task DeleteBookAsync(Guid id);

    // Issue/Return
    Task<IEnumerable<LibraryBookIssue>> GetBookIssuesAsync();
    Task<LibraryBookIssue?> GetBookIssueByIdAsync(Guid id);
    Task<LibraryBookIssue> IssueBookAsync(LibraryBookIssue issue);
    Task ReturnBookAsync(Guid issueId, DateTime returnDate, decimal fineAmount, string? remarks);
    Task<IEnumerable<LibraryBookIssue>> GetStudentIssueHistoryAsync(Guid studentId);
}
