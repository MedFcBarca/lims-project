using System.Globalization;
using System.Text.Json;
using Lims.Api.Models;

namespace Lims.Api.Services;

public class OcrService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public OcrService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<string> ExtractTextAsync(IFormFile file)
    {
        var key = _config["OCR:Key"];
        var endpoint = _config["OCR:Endpoint"];

        var url = $"{endpoint}formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31";

        using var stream = file.OpenReadStream();

        var content = new StreamContent(stream);
        content.Headers.ContentType =
            new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);

        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("Ocp-Apim-Subscription-Key", key);
        request.Content = content;

        var response = await _httpClient.SendAsync(request);

        if (!response.Headers.Contains("Operation-Location"))
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception("Azure OCR error: " + error);
        }

        var operationLocation = response.Headers.GetValues("Operation-Location").First();

        await Task.Delay(2000);

        var resultRequest = new HttpRequestMessage(HttpMethod.Get, operationLocation);
        resultRequest.Headers.Add("Ocp-Apim-Subscription-Key", key);

        var resultResponse = await _httpClient.SendAsync(resultRequest);
        return await resultResponse.Content.ReadAsStringAsync();
    }

    public List<Analysis> ParseLabReport(string content, int sampleId)
    {
        var analyses = new List<Analysis>();

        var lines = content
            .Split('\n')
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        var knownParameters = new Dictionary<string, (double Threshold, string Unit)>
        {
            { "Total Coliform Bacteria", (1, "# /100ml") },
            { "Nitrate-Nitrogen", (50, "mg/L") },
            { "PH", (8.5, "units") },
            { "pH", (8.5, "units") },
            { "Iron", (0.3, "mg/L") },
            { "Hardness as CaCo3", (300, "mg/L") },
            { "Sulfate Sulfur", (250, "mg/L") },
            { "Chloride", (250, "mg/L") },
            { "Specific Conductance", (500, "umhos/cc") }
        };

        for (var i = 0; i < lines.Count - 1; i++)
        {
            var parameter = lines[i];

            if (!knownParameters.ContainsKey(parameter))
                continue;

            var nextLine = lines[i + 1].Replace(",", ".");

            if (!double.TryParse(nextLine, NumberStyles.Any, CultureInfo.InvariantCulture, out var value))
                continue;

            var config = knownParameters[parameter];

            analyses.Add(new Analysis
            {
                Parameter = parameter,
                Value = value,
                Unit = config.Unit,
                Threshold = config.Threshold,
                SampleId = sampleId,
                IsCompliant = value <= config.Threshold
            });
        }

        return analyses;
    }

    public string GetContentFromAzureJson(string json)
    {
        using var doc = JsonDocument.Parse(json);

        return doc.RootElement
            .GetProperty("analyzeResult")
            .GetProperty("content")
            .GetString() ?? string.Empty;
    }
}