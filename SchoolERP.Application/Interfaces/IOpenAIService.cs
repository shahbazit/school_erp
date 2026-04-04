using SchoolERP.Application.DTOs.SubjectContent;

namespace SchoolERP.Application.Interfaces;

public interface IOpenAIService
{
    Task<AiResult<string>> CreateChatCompletionAsync(string prompt, string systemMessage = "You are a helpful education assistant.");
    Task<AiResult<string>> CreateChatCompletionAsync(List<ChatMessage> messages, string model = "gpt-4o-mini");
    Task<float[]> GetEmbeddingsAsync(string text);
    Task<AiResult<string>> SummarizeTextAsync(string text);
    Task<AiResult<string>> ExtractTextFromImageAsync(string base64Image);
    Task<AiResult<string>> GenerateQuizAsync(string text);
}

public class ChatMessage
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
