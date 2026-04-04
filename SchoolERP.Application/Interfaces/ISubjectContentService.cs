using SchoolERP.Application.DTOs.SubjectContent;

namespace SchoolERP.Application.Interfaces;

public interface ISubjectContentService
{
    // Books
    Task<List<SubjectBookDto>> GetBooksAsync(Guid? classId, Guid? subjectId);
    Task<SubjectBookDto> CreateBookAsync(CreateSubjectBookDto dto);
    Task<SubjectBookDto> GetBookByIdAsync(Guid id);
    Task DeleteBookAsync(Guid bookId);

    // Chapters
    Task<List<SubjectChapterDto>> GetChaptersByBookAsync(Guid bookId);
    Task<SubjectChapterDto> GetChapterDetailsAsync(Guid chapterId);
    Task<SubjectChapterDto> CreateChapterAsync(CreateSubjectChapterDto dto);
    Task DeleteChapterAsync(Guid chapterId);
    Task<List<AiChatHistoryDto>> GetChatHistoryAsync(Guid chapterId);
    Task ClearChatHistoryAsync(Guid chapterId);

    // Content
    Task<ChapterContentDto> AddContentToChapterAsync(CreateChapterContentDto dto);
    Task DeleteContentAsync(Guid contentId);
    
    // AI Features
    Task<string> GenerateChapterSummaryAsync(Guid chapterId);
    Task<AiResponse> AskQuestionAsync(AiQuestionRequest request);
    Task<string> ExtractTextFromImageAsync(string base64Image);
    Task<string> GenerateQuizAsync(Guid chapterId);
    Task<string> UploadCoverImageAsync(Microsoft.AspNetCore.Http.IFormFile file);
    Task<object> GetAiUsageStatsAsync();
}
