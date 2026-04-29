using System.Text;
using System.Text.Json;

namespace Lims.Api.Services;

public class TranslationService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public TranslationService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> TranslateAsync(string text, string targetLanguage)
    {
        var results = await TranslateBatchAsync(new List<string> { text }, targetLanguage);
        return results[0];
    }

    public async Task<List<string>> TranslateBatchAsync(List<string> texts, string targetLanguage)
    {
        var key = _configuration["AzureTranslator:Key"];
        var region = _configuration["AzureTranslator:Region"];
        var endpoint = _configuration["AzureTranslator:Endpoint"];

        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Azure Translator key is missing.");

        if (targetLanguage == "fr")
            return texts;

        var url = $"{endpoint}/translate?api-version=3.0&to={targetLanguage}";

        var body = JsonSerializer.Serialize(
            texts.Select(text => new { Text = text })
        );

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("Ocp-Apim-Subscription-Key", key);
        request.Headers.Add("Ocp-Apim-Subscription-Region", region);
        request.Content = new StringContent(body, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Azure Translator error: {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        var translations = new List<string>();

        foreach (var item in document.RootElement.EnumerateArray())
        {
            var translatedText = item
                .GetProperty("translations")[0]
                .GetProperty("text")
                .GetString();

            translations.Add(translatedText ?? string.Empty);
        }

        return translations;
    }
}