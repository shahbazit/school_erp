using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using SchoolERP.Application.DTOs.SubjectContent;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.Infrastructure.Services;

public class SubjectContentService : ISubjectContentService
{
    private readonly ApplicationDbContext _context;
    private readonly IOpenAIService _openAiService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileService _fileService;

    public SubjectContentService(
        ApplicationDbContext context, 
        IOpenAIService openAiService,
        ICurrentUserService currentUserService,
        IFileService fileService)
    {
        _context = context;
        _openAiService = openAiService;
        _currentUserService = currentUserService;
        _fileService = fileService;
    }

    private async Task LogAiUsage(string feature, AiUsageMetadata usage)
    {
        var log = new AiUsageLog
        {
            UserId = _currentUserService.UserId ?? Guid.Empty,
            FeatureName = feature,
            Model = usage.Model,
            PromptTokens = usage.PromptTokens,
            CompletionTokens = usage.CompletionTokens,
            Timestamp = DateTime.UtcNow
        };

        _context.AiUsageLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<List<SubjectBookDto>> GetBooksAsync(Guid? classId, Guid? subjectId)
    {
        var query = _context.SubjectBooks.AsQueryable();

        if (classId.HasValue && classId != Guid.Empty)
            query = query.Where(b => b.AcademicClassId == classId);
        
        if (subjectId.HasValue && subjectId != Guid.Empty)
            query = query.Where(b => b.SubjectId == subjectId);

        return await query.Select(b => new SubjectBookDto
        {
            Id = b.Id,
            AcademicClassId = b.AcademicClassId,
            SubjectId = b.SubjectId,
            Name = b.Name,
            Description = b.Description,
            CoverImageUrl = b.CoverImageUrl,
            ChapterCount = b.Chapters.Count
        }).ToListAsync();
    }

    public async Task<SubjectBookDto> CreateBookAsync(CreateSubjectBookDto dto)
    {
        var book = new SubjectBook
        {
            AcademicClassId = dto.AcademicClassId,
            SubjectId = dto.SubjectId,
            Name = dto.Name,
            Description = dto.Description,
            CoverImageUrl = dto.CoverImageUrl
        };

        _context.SubjectBooks.Add(book);
        await _context.SaveChangesAsync();

        return new SubjectBookDto
        {
            Id = book.Id,
            AcademicClassId = book.AcademicClassId,
            SubjectId = book.SubjectId,
            Name = book.Name,
            Description = book.Description,
            CoverImageUrl = book.CoverImageUrl,
            ChapterCount = 0
        };
    }

    public async Task<SubjectBookDto> GetBookByIdAsync(Guid id)
    {
        return await _context.SubjectBooks
            .Where(b => b.Id == id)
            .Select(b => new SubjectBookDto
            {
                Id = b.Id,
                AcademicClassId = b.AcademicClassId,
                SubjectId = b.SubjectId,
                Name = b.Name,
                Description = b.Description,
                CoverImageUrl = b.CoverImageUrl,
                ChapterCount = _context.SubjectChapters.Count(c => c.SubjectBookId == b.Id)
            })
            .FirstOrDefaultAsync();
    }

    public async Task DeleteBookAsync(Guid bookId)
    {
        var book = await _context.SubjectBooks
            .Include(b => b.Chapters)
                .ThenInclude(c => c.Contents)
            .FirstOrDefaultAsync(b => b.Id == bookId);

        if (book != null)
        {
            foreach (var chapter in book.Chapters)
            {
                // Delete chat history for each chapter
                var chatHistory = _context.AiChatHistories.Where(h => h.ChapterId == chapter.Id);
                _context.AiChatHistories.RemoveRange(chatHistory);
                
                _context.ChapterContents.RemoveRange(chapter.Contents);
            }
            _context.SubjectChapters.RemoveRange(book.Chapters);
            _context.SubjectBooks.Remove(book);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<SubjectChapterDto>> GetChaptersByBookAsync(Guid bookId)
    {
        return await _context.SubjectChapters
            .Where(sc => sc.SubjectBookId == bookId)
            .OrderBy(sc => sc.OrderIndex)
            .Select(sc => new SubjectChapterDto
            {
                Id = sc.Id,
                SubjectBookId = sc.SubjectBookId,
                Title = sc.Title,
                Description = sc.Description,
                OrderIndex = sc.OrderIndex,
                Summary = sc.Summary
            })
            .ToListAsync();
    }

    public async Task<SubjectChapterDto> GetChapterDetailsAsync(Guid chapterId)
    {
        var chapter = await _context.SubjectChapters
            .Include(sc => sc.Contents)
            .FirstOrDefaultAsync(sc => sc.Id == chapterId);

        if (chapter == null) return null!;

        return new SubjectChapterDto
        {
            Id = chapter.Id,
            SubjectBookId = chapter.SubjectBookId,
            Title = chapter.Title,
            Description = chapter.Description,
            OrderIndex = chapter.OrderIndex,
            Summary = chapter.Summary,
            Contents = chapter.Contents.OrderBy(c => c.OrderIndex).ThenBy(c => c.PageNumber).Select(c => new ChapterContentDto
            {
                Id = c.Id,
                ChapterId = c.ChapterId,
                ContentType = c.ContentType,
                ContentValue = c.ContentValue,
                OrderIndex = c.OrderIndex,
                PageNumber = c.PageNumber
            }).ToList()
        };
    }

    public async Task<SubjectChapterDto> CreateChapterAsync(CreateSubjectChapterDto dto)
    {
        var chapter = new SubjectChapter
        {
            SubjectBookId = dto.SubjectBookId,
            Title = dto.Title,
            Description = dto.Description,
            OrderIndex = dto.OrderIndex
        };

        _context.SubjectChapters.Add(chapter);
        await _context.SaveChangesAsync();

        return await GetChapterDetailsAsync(chapter.Id);
    }

    public async Task DeleteChapterAsync(Guid chapterId)
    {
        var chapter = await _context.SubjectChapters
            .Include(c => c.Contents)
            .FirstOrDefaultAsync(c => c.Id == chapterId);
            
        if (chapter != null)
        {
            // Delete chat history for the chapter
            var chatHistory = _context.AiChatHistories.Where(h => h.ChapterId == chapterId);
            _context.AiChatHistories.RemoveRange(chatHistory);

            _context.ChapterContents.RemoveRange(chapter.Contents);
            _context.SubjectChapters.Remove(chapter);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<AiChatHistoryDto>> GetChatHistoryAsync(Guid chapterId)
    {
        var userId = _currentUserService.UserId ?? Guid.Empty;
        return await _context.AiChatHistories
            .Where(h => h.ChapterId == chapterId && h.UserId == userId)
            .OrderBy(h => h.Timestamp)
            .Select(h => new AiChatHistoryDto
            {
                Id = h.Id,
                Role = h.Role,
                Content = h.Content,
                Timestamp = h.Timestamp
            })
            .ToListAsync();
    }

    public async Task ClearChatHistoryAsync(Guid chapterId)
    {
        var userId = _currentUserService.UserId ?? Guid.Empty;
        var history = _context.AiChatHistories
            .Where(h => h.ChapterId == chapterId && h.UserId == userId);
        
        _context.AiChatHistories.RemoveRange(history);
        await _context.SaveChangesAsync();
    }

    public async Task<ChapterContentDto> AddContentToChapterAsync(CreateChapterContentDto dto)
    {
        var content = new ChapterContent
        {
            ChapterId = dto.ChapterId,
            ContentType = dto.ContentType,
            ContentValue = dto.ContentValue,
            OrderIndex = dto.OrderIndex,
            PageNumber = dto.PageNumber
        };

        _context.ChapterContents.Add(content);
        await _context.SaveChangesAsync();

        return new ChapterContentDto
        {
            Id = content.Id,
            ChapterId = content.ChapterId,
            ContentType = content.ContentType,
            ContentValue = content.ContentValue,
            OrderIndex = content.OrderIndex,
            PageNumber = content.PageNumber
        };
    }

    public async Task DeleteContentAsync(Guid contentId)
    {
        var content = await _context.ChapterContents.FindAsync(contentId);
        if (content != null)
        {
            _context.ChapterContents.Remove(content);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GenerateChapterSummaryAsync(Guid chapterId)
    {
        var chapter = await _context.SubjectChapters
            .Include(sc => sc.Contents)
            .FirstOrDefaultAsync(sc => sc.Id == chapterId);

        if (chapter == null) return "Chapter not found.";

        var textContent = string.Join("\n", chapter.Contents
            .Where(c => c.ContentType == ContentType.Text)
            .OrderBy(c => c.OrderIndex)
            .Select(c => c.ContentValue));

        if (string.IsNullOrWhiteSpace(textContent)) return "No text content found to summarize.";

        var result = await _openAiService.SummarizeTextAsync(textContent);
        
        await LogAiUsage("Summarize", result.Usage);

        chapter.Summary = result.Value;
        await _context.SaveChangesAsync();

        return result.Value;
    }

    public async Task<AiResponse> AskQuestionAsync(AiQuestionRequest request)
    {
        var chapter = await _context.SubjectChapters
            .Include(sc => sc.Contents)
            .FirstOrDefaultAsync(sc => sc.Id == request.ChapterId);

        if (chapter == null) return new AiResponse { Answer = "Chapter not found." };

        var textContent = string.Join("\n", chapter.Contents
            .Where(c => c.ContentType == ContentType.Text)
            .OrderBy(c => c.OrderIndex)
            .Select(c => c.ContentValue));
        
        if (string.IsNullOrWhiteSpace(textContent)) 
            return new AiResponse { Answer = "I don't have any text material for this chapter to base my answers on. Please add some text content first!" };
        
        var userId = _currentUserService.UserId ?? Guid.Empty;
        
        // Fetch recent history (last 25 messages)
        var recentHistory = await _context.AiChatHistories
            .Where(h => h.ChapterId == request.ChapterId && h.UserId == userId)
            .OrderByDescending(h => h.Timestamp)
            .Take(25)
            .ToListAsync();
        
        // Arrange in chronological order
        recentHistory = recentHistory.OrderBy(h => h.Timestamp).ToList();

        var messages = new List<ChatMessage>();
        
        // System message with context
        messages.Add(new ChatMessage { 
            Role = "system", 
            Content = $"You are a helpful school tutor. Use the following context about the chapter '{chapter.Title}' to answer accurately:\n\n{textContent}" 
        });

        // Add history
        foreach (var h in recentHistory)
        {
            messages.Add(new ChatMessage { Role = h.Role, Content = h.Content });
        }

        // Add current question
        messages.Add(new ChatMessage { Role = "user", Content = request.Question });

        var result = await _openAiService.CreateChatCompletionAsync(messages);

        await LogAiUsage("Q&A", result.Usage);

        // Save History
        var chatHistory = new List<AiChatHistory>
        {
            new AiChatHistory { UserId = userId, ChapterId = request.ChapterId, Role = "user", Content = request.Question },
            new AiChatHistory { UserId = userId, ChapterId = request.ChapterId, Role = "ai", Content = result.Value }
        };
        _context.AiChatHistories.AddRange(chatHistory);
        await _context.SaveChangesAsync();

        return new AiResponse
        {
            Answer = result.Value,
            Sources = new List<string> { chapter.Title }
        };
    }

    public async Task<string> ExtractTextFromImageAsync(string base64Image)
    {
        var result = await _openAiService.ExtractTextFromImageAsync(base64Image);
        await LogAiUsage("OCR", result.Usage);
        return result.Value;
    }

    public async Task<string> GenerateQuizAsync(Guid chapterId)
    {
        var chapter = await _context.SubjectChapters
            .Include(sc => sc.Contents)
            .FirstOrDefaultAsync(sc => sc.Id == chapterId);

        if (chapter == null) return "Chapter not found.";

        var textContent = string.Join("\n", chapter.Contents
            .Where(c => c.ContentType == ContentType.Text)
            .OrderBy(c => c.OrderIndex)
            .Select(c => c.ContentValue));

        if (string.IsNullOrWhiteSpace(textContent)) return "No text content found to generate a quiz.";

        var result = await _openAiService.GenerateQuizAsync(textContent);
        await LogAiUsage("Quiz", result.Usage);

        return result.Value;
    }

    public async Task<string> UploadCoverImageAsync(Microsoft.AspNetCore.Http.IFormFile file)
    {
        return await _fileService.UploadFileAsync(file, "book-covers");
    }

    public async Task<object> GetAiUsageStatsAsync()
    {
        var logs = await _context.AiUsageLogs.ToListAsync();
        
        return new
        {
            TotalTokens = logs.Sum(l => l.TotalTokens),
            TotalPromptTokens = logs.Sum(l => l.PromptTokens),
            TotalCompletionTokens = logs.Sum(l => l.CompletionTokens),
            UsageByFeature = logs.GroupBy(l => l.FeatureName)
                .Select(g => new { Feature = g.Key, Tokens = g.Sum(l => l.TotalTokens) }),
            UsageByModel = logs.GroupBy(l => l.Model)
                .Select(g => new { Model = g.Key, Tokens = g.Sum(l => l.TotalTokens) })
        };
    }
}
