using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.Infrastructure.Services;

public class LibraryService : ILibraryService
{
    private readonly ApplicationDbContext _context;

    public LibraryService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Categories
    public async Task<IEnumerable<LibraryCategory>> GetCategoriesAsync()
    {
        return await _context.LibraryCategories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<LibraryCategory?> GetCategoryByIdAsync(Guid id)
    {
        return await _context.LibraryCategories.FindAsync(id);
    }

    public async Task<LibraryCategory> CreateCategoryAsync(LibraryCategory category)
    {
        _context.LibraryCategories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task UpdateCategoryAsync(LibraryCategory category)
    {
        _context.Entry(category).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(Guid id)
    {
        var category = await _context.LibraryCategories.FindAsync(id);
        if (category != null)
        {
            _context.LibraryCategories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }

    // Books
    public async Task<IEnumerable<LibraryBook>> GetBooksAsync()
    {
        return await _context.LibraryBooks
            .Include(b => b.Category)
            .OrderBy(b => b.Title)
            .ToListAsync();
    }

    public async Task<LibraryBook?> GetBookByIdAsync(Guid id)
    {
        return await _context.LibraryBooks
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<LibraryBook> CreateBookAsync(LibraryBook book)
    {
        _context.LibraryBooks.Add(book);
        await _context.SaveChangesAsync();
        return book;
    }

    public async Task UpdateBookAsync(LibraryBook book)
    {
        _context.Entry(book).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteBookAsync(Guid id)
    {
        var book = await _context.LibraryBooks.FindAsync(id);
        if (book != null)
        {
            _context.LibraryBooks.Remove(book);
            await _context.SaveChangesAsync();
        }
    }

    // Issue/Return
    public async Task<IEnumerable<LibraryBookIssue>> GetBookIssuesAsync()
    {
        return await _context.LibraryBookIssues
            .Include(bi => bi.Book)
            .Include(bi => bi.Student)
            .Include(bi => bi.Employee)
            .OrderByDescending(bi => bi.IssueDate)
            .ToListAsync();
    }

    public async Task<LibraryBookIssue?> GetBookIssueByIdAsync(Guid id)
    {
        return await _context.LibraryBookIssues
            .Include(bi => bi.Book)
            .Include(bi => bi.Student)
            .Include(bi => bi.Employee)
            .FirstOrDefaultAsync(bi => bi.Id == id);
    }

    public async Task<LibraryBookIssue> IssueBookAsync(LibraryBookIssue issue)
    {
        var book = await _context.LibraryBooks.FindAsync(issue.BookId);
        if (book == null || book.AvailableCopies <= 0)
        {
            throw new Exception("Book not available for issue.");
        }

        book.AvailableCopies--;
        _context.LibraryBookIssues.Add(issue);
        await _context.SaveChangesAsync();
        return issue;
    }

    public async Task ReturnBookAsync(Guid issueId, DateTime returnDate, decimal fineAmount, string? remarks)
    {
        var issue = await _context.LibraryBookIssues.FindAsync(issueId);
        if (issue == null || issue.Status != LibraryIssueStatus.Issued)
        {
            throw new Exception("Invalid issue record.");
        }

        issue.ReturnDate = returnDate;
        issue.FineAmount = fineAmount;
        issue.Status = LibraryIssueStatus.Returned;
        issue.Remarks = remarks;

        var book = await _context.LibraryBooks.FindAsync(issue.BookId);
        if (book != null)
        {
            book.AvailableCopies++;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<LibraryBookIssue>> GetStudentIssueHistoryAsync(Guid studentId)
    {
        return await _context.LibraryBookIssues
            .Include(bi => bi.Book)
            .Where(bi => bi.StudentId == studentId)
            .OrderByDescending(bi => bi.IssueDate)
            .ToListAsync();
    }
}
