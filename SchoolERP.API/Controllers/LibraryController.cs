using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _libraryService;

    public LibraryController(ILibraryService libraryService)
    {
        _libraryService = libraryService;
    }

    #region Categories

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _libraryService.GetCategoriesAsync();
        return Ok(categories.Select(c => new LibraryCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description
        }));
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory(LibraryCategoryDto dto)
    {
        var category = new LibraryCategory
        {
            Name = dto.Name,
            Description = dto.Description
        };
        await _libraryService.CreateCategoryAsync(category);
        return Ok(category);
    }

    [HttpPost("categories/{id}/update")]
    public async Task<IActionResult> UpdateCategory(Guid id, LibraryCategoryDto dto)
    {
        var category = await _libraryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();

        category.Name = dto.Name;
        category.Description = dto.Description;

        await _libraryService.UpdateCategoryAsync(category);
        return Ok(category);
    }

    [HttpPost("categories/{id}/delete")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await _libraryService.DeleteCategoryAsync(id);
        return Ok();
    }

    #endregion

    #region Books

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks()
    {
        var books = await _libraryService.GetBooksAsync();
        return Ok(books.Select(MapBookToDto));
    }

    [HttpGet("books/{id}")]
    public async Task<IActionResult> GetBook(Guid id)
    {
        var book = await _libraryService.GetBookByIdAsync(id);
        if (book == null) return NotFound();
        return Ok(MapBookToDto(book));
    }

    [HttpPost("books")]
    public async Task<IActionResult> CreateBook(LibraryBookDto dto)
    {
        var book = new LibraryBook
        {
            Title = dto.Title,
            Author = dto.Author,
            Publisher = dto.Publisher,
            Edition = dto.Edition,
            ISBN = dto.ISBN,
            CategoryId = dto.CategoryId,
            TotalCopies = dto.TotalCopies,
            AvailableCopies = dto.TotalCopies, // Initial availability is total copies
            Location = dto.Location,
            Price = dto.Price
        };
        await _libraryService.CreateBookAsync(book);
        return Ok(MapBookToDto(book));
    }

    [HttpPost("books/{id}/update")]
    public async Task<IActionResult> UpdateBook(Guid id, LibraryBookDto dto)
    {
        var book = await _libraryService.GetBookByIdAsync(id);
        if (book == null) return NotFound();

        // If total copies changed, update available copies adjustment
        int diff = dto.TotalCopies - book.TotalCopies;
        book.AvailableCopies += diff;

        book.Title = dto.Title;
        book.Author = dto.Author;
        book.Publisher = dto.Publisher;
        book.Edition = dto.Edition;
        book.ISBN = dto.ISBN;
        book.CategoryId = dto.CategoryId;
        book.TotalCopies = dto.TotalCopies;
        book.Location = dto.Location;
        book.Price = dto.Price;

        await _libraryService.UpdateBookAsync(book);
        return Ok(MapBookToDto(book));
    }

    [HttpPost("books/{id}/delete")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        await _libraryService.DeleteBookAsync(id);
        return Ok();
    }

    #endregion

    #region Issue/Return

    [HttpGet("issues")]
    public async Task<IActionResult> GetIssues()
    {
        var issues = await _libraryService.GetBookIssuesAsync();
        return Ok(issues.Select(MapIssueToDto));
    }

    [HttpPost("issues")]
    public async Task<IActionResult> IssueBook(LibraryBookIssueDto dto)
    {
        var issue = new LibraryBookIssue
        {
            BookId = dto.BookId,
            StudentId = dto.StudentId,
            EmployeeId = dto.EmployeeId,
            IssueDate = dto.IssueDate == default ? DateTime.UtcNow : dto.IssueDate,
            DueDate = dto.DueDate,
            Status = LibraryIssueStatus.Issued
        };

        try
        {
            await _libraryService.IssueBookAsync(issue);
            return Ok(MapIssueToDto(issue));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("issues/{id}/return")]
    public async Task<IActionResult> ReturnBook(Guid id, [FromBody] ReturnBookRequest request)
    {
        try
        {
            await _libraryService.ReturnBookAsync(id, request.ReturnDate, request.FineAmount, request.Remarks);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("student/{studentId}/history")]
    public async Task<IActionResult> GetStudentHistory(Guid studentId)
    {
        var history = await _libraryService.GetStudentIssueHistoryAsync(studentId);
        return Ok(history.Select(MapIssueToDto));
    }

    #endregion

    private LibraryBookDto MapBookToDto(LibraryBook b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        Author = b.Author,
        Publisher = b.Publisher,
        Edition = b.Edition,
        ISBN = b.ISBN,
        CategoryId = b.CategoryId,
        CategoryName = b.Category?.Name,
        TotalCopies = b.TotalCopies,
        AvailableCopies = b.AvailableCopies,
        Location = b.Location,
        Price = b.Price
    };

    private LibraryBookIssueDto MapIssueToDto(LibraryBookIssue bi) => new()
    {
        Id = bi.Id,
        BookId = bi.BookId,
        BookTitle = bi.Book?.Title,
        StudentId = bi.StudentId,
        StudentName = bi.Student != null ? $"{bi.Student.FirstName} {bi.Student.LastName}" : null,
        AdmissionNumber = bi.Student?.AdmissionNo,
        EmployeeId = bi.EmployeeId,
        EmployeeName = bi.Employee != null ? $"{bi.Employee.FirstName} {bi.Employee.LastName}" : null,
        EmployeeCode = bi.Employee?.EmployeeCode,
        IssueDate = bi.IssueDate,
        DueDate = bi.DueDate,
        ReturnDate = bi.ReturnDate,
        FineAmount = bi.FineAmount,
        Status = bi.Status.ToString(),
        Remarks = bi.Remarks
    };

    public class ReturnBookRequest
    {
        public DateTime ReturnDate { get; set; } = DateTime.UtcNow;
        public decimal FineAmount { get; set; }
        public string? Remarks { get; set; }
    }
}
