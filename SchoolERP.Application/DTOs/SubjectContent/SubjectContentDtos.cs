using SchoolERP.Domain.Entities;

namespace SchoolERP.Application.DTOs.SubjectContent;

public class SubjectChapterDto
{
    public Guid Id { get; set; }
    public Guid SubjectBookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
    public string? Summary { get; set; }
    public List<ChapterContentDto> Contents { get; set; } = new();
}

public class ChapterContentDto
{
    public Guid Id { get; set; }
    public Guid ChapterId { get; set; }
    public ContentType ContentType { get; set; }
    public string ContentValue { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int? PageNumber { get; set; }
}

public class CreateSubjectChapterDto
{
    public Guid SubjectBookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateChapterContentDto
{
    public Guid ChapterId { get; set; }
    public ContentType ContentType { get; set; }
    public string ContentValue { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int? PageNumber { get; set; }
}

public class AiQuestionRequest
{
    public Guid ChapterId { get; set; }
    public string Question { get; set; } = string.Empty;
}

public class AiResponse
{
    public string Answer { get; set; } = string.Empty;
    public List<string> Sources { get; set; } = new();
}

public class AiUsageMetadata
{
    public string Model { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
}

public class AiResult<T>
{
    public T Value { get; set; } = default!;
    public AiUsageMetadata Usage { get; set; } = new();
}

public class SubjectBookDto
{
    public Guid Id { get; set; }
    public Guid AcademicClassId { get; set; }
    public Guid SubjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public int ChapterCount { get; set; }
}

public class CreateSubjectBookDto
{
    public Guid AcademicClassId { get; set; }
    public Guid SubjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class AiChatHistoryDto
{
    public Guid Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
