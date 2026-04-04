using Microsoft.Extensions.Configuration;
using SchoolERP.Application.Interfaces;
using SchoolERP.Application.DTOs.SubjectContent;
using System.Net.Http.Json;
using System.Text.Json;
using System.Net.Http.Headers;

namespace SchoolERP.Infrastructure.Services;

public class OpenAIService : IOpenAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public OpenAIService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["OpenAI:ApiKey"] ?? string.Empty;
        if (!string.IsNullOrEmpty(_apiKey))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }
    }

    public async Task<AiResult<string>> CreateChatCompletionAsync(List<ChatMessage> messages, string model = "gpt-4o-mini")
    {
        var request = new
        {
            model = model,
            messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
            temperature = 0.7
        };

        var response = await _httpClient.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", request);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var content = body.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;
        var usage = body.GetProperty("usage");

        return new AiResult<string>
        {
            Value = content,
            Usage = new AiUsageMetadata
            {
                Model = model,
                PromptTokens = usage.GetProperty("prompt_tokens").GetInt32(),
                CompletionTokens = usage.GetProperty("completion_tokens").GetInt32()
            }
        };
    }

    public async Task<AiResult<string>> CreateChatCompletionAsync(string prompt, string systemMessage = "You are a helpful education assistant.")
    {
        var messages = new List<ChatMessage>
        {
            new ChatMessage { Role = "system", Content = systemMessage },
            new ChatMessage { Role = "user", Content = prompt }
        };
        return await CreateChatCompletionAsync(messages);
    }

    public async Task<float[]> GetEmbeddingsAsync(string text)
    {
        var request = new { model = "text-embedding-3-small", input = text };
        var response = await _httpClient.PostAsJsonAsync("https://api.openai.com/v1/embeddings", request);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var embeddingJson = body.GetProperty("data")[0].GetProperty("embedding");
        return JsonSerializer.Deserialize<float[]>(embeddingJson.GetRawText()) ?? Array.Empty<float>();
    }

    public async Task<AiResult<string>> SummarizeTextAsync(string text)
    {
        var prompt = $"Please provide a concise summary of the following educational content. Focus on key terms and concepts. Format in markdown.\n\nContent:\n{text}";
        return await CreateChatCompletionAsync(prompt, "You are an expert educational content summarizer.");
    }

    public async Task<AiResult<string>> ExtractTextFromImageAsync(string base64Image)
    {
        var model = "gpt-4o";
        var request = new
        {
            model = model,
            messages = new[]
            {
                new { 
                    role = "user", 
                    content = new object[]
                    {
                        new { type = "text", text = "Please extract all text from this image accurately. Maintain the structure and paragraphs. Only return the extracted text without any conversational filler." },
                        new { type = "image_url", image_url = new { url = base64Image } }
                    }
                }
            },
            max_tokens = 2000
        };

        var response = await _httpClient.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", request);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var content = body.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;
        var usage = body.GetProperty("usage");

        return new AiResult<string>
        {
            Value = content,
            Usage = new AiUsageMetadata
            {
                Model = model,
                PromptTokens = usage.GetProperty("prompt_tokens").GetInt32(),
                CompletionTokens = usage.GetProperty("completion_tokens").GetInt32()
            }
        };
    }

    public async Task<AiResult<string>> GenerateQuizAsync(string text)
    {
        var prompt = $"Please generate a practice quiz based on the following educational content. Include 3 Multiple Choice Questions (with options A, B, C, D) and 2 Short Answer Questions. Format in markdown.\n\nContent:\n{text}";
        return await CreateChatCompletionAsync(prompt, "You are an expert educational assessment creator.");
    }
}
