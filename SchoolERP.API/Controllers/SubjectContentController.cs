using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.SubjectContent;
using SchoolERP.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace SchoolERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubjectContentController : ControllerBase
{
    private readonly ISubjectContentService _contentService;

    public SubjectContentController(ISubjectContentService contentService)
    {
        _contentService = contentService;
    }

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks(Guid? classId, Guid? subjectId)
    {
        var result = await _contentService.GetBooksAsync(classId, subjectId);
        return Ok(result);
    }

    [HttpPost("book")]
    public async Task<IActionResult> CreateBook(CreateSubjectBookDto dto)
    {
        var result = await _contentService.CreateBookAsync(dto);
        return Ok(result);
    }

    [HttpPost("book/delete/{id}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        await _contentService.DeleteBookAsync(id);
        return Ok();
    }

    [HttpGet("book/{id}")]
    public async Task<IActionResult> GetBook(Guid id)
    {
        var result = await _contentService.GetBookByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("chapters/{bookId}")]
    public async Task<IActionResult> GetChapters(Guid bookId)
    {
        var result = await _contentService.GetChaptersByBookAsync(bookId);
        return Ok(result);
    }

    [HttpGet("chapter/{chapterId}")]
    public async Task<IActionResult> GetChapterDetails(Guid chapterId)
    {
        var result = await _contentService.GetChapterDetailsAsync(chapterId);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("chapter")]
    public async Task<IActionResult> CreateChapter(CreateSubjectChapterDto dto)
    {
        var result = await _contentService.CreateChapterAsync(dto);
        return Ok(result);
    }

    [HttpPost("chapter/delete/{id}")]
    public async Task<IActionResult> DeleteChapter(Guid id)
    {
        await _contentService.DeleteChapterAsync(id);
        return Ok();
    }

    [HttpPost("content")]
    public async Task<IActionResult> AddContent(CreateChapterContentDto dto)
    {
        var result = await _contentService.AddContentToChapterAsync(dto);
        return Ok(result);
    }

    [HttpPost("content/delete/{id}")]
    public async Task<IActionResult> DeleteContent(Guid id)
    {
        await _contentService.DeleteContentAsync(id);
        return Ok();
    }

    [HttpPost("summarize/{chapterId}")]
    public async Task<IActionResult> Summarize(Guid chapterId)
    {
        var summary = await _contentService.GenerateChapterSummaryAsync(chapterId);
        return Ok(new { summary });
    }

    [HttpPost("ask")]
    public async Task<IActionResult> AskQuestion(AiQuestionRequest request)
    {
        var response = await _contentService.AskQuestionAsync(request);
        return Ok(response);
    }

    [HttpGet("chat-history/{chapterId}")]
    public async Task<IActionResult> GetChatHistory(Guid chapterId)
    {
        var history = await _contentService.GetChatHistoryAsync(chapterId);
        return Ok(history);
    }

    [HttpPost("chat-history/clear/{chapterId}")]
    public async Task<IActionResult> ClearChatHistory(Guid chapterId)
    {
        await _contentService.ClearChatHistoryAsync(chapterId);
        return Ok();
    }

    [HttpPost("extract-text")]
    public async Task<IActionResult> ExtractText([FromBody] string base64Image)
    {
        var extractedText = await _contentService.ExtractTextFromImageAsync(base64Image);
        return Ok(new { extractedText });
    }

    [HttpPost("generate-quiz/{chapterId}")]
    public async Task<IActionResult> GenerateQuiz(Guid chapterId)
    {
        var quiz = await _contentService.GenerateQuizAsync(chapterId);
        return Ok(new { quiz });
    }

    [HttpPost("upload-cover")]
    public async Task<IActionResult> UploadCover(Microsoft.AspNetCore.Http.IFormFile file)
    {
        var url = await _contentService.UploadCoverImageAsync(file);
        return Ok(new { url });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _contentService.GetAiUsageStatsAsync();
        return Ok(stats);
    }
}
