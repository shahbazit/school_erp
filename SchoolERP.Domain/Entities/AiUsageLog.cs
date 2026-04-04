using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class AiUsageLog : BaseEntity
{
    public Guid UserId { get; set; }
    public string FeatureName { get; set; } = string.Empty; // Summarize, Q&A, OCR, Quiz
    public string Model { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens => PromptTokens + CompletionTokens;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual User? User { get; set; }
}
