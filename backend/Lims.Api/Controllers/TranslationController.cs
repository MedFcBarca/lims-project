using Lims.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TranslationController : ControllerBase
{
    private readonly TranslationService _translationService;

    public TranslationController(TranslationService translationService)
    {
        _translationService = translationService;
    }

    [HttpPost]
    public async Task<IActionResult> Translate(TranslateRequest request)
    {
        var translatedText = await _translationService.TranslateAsync(
            request.Text,
            request.TargetLanguage
        );

        return Ok(new
        {
            originalText = request.Text,
            translatedText,
            targetLanguage = request.TargetLanguage
        });
    }
}

public class TranslateRequest
{
    public string Text { get; set; } = string.Empty;
    public string TargetLanguage { get; set; } = "en";
}