using Lims.Api.Data;
using Lims.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OcrController : ControllerBase
{
    private readonly OcrService _ocr;
    private readonly AppDbContext _context;

    public OcrController(OcrService ocr, AppDbContext context)
    {
        _ocr = ocr;
        _context = context;
    }

    [HttpPost("extract")]
    public async Task<IActionResult> Extract(IFormFile file)
    {
        if (file == null)
            return BadRequest("No file uploaded");

        var json = await _ocr.ExtractTextAsync(file);
        var content = _ocr.GetContentFromAzureJson(json);

        return Ok(new
        {
            rawText = content
        });
    }

    [HttpPost("extract-and-create/{sampleId:int}")]
    public async Task<IActionResult> ExtractAndCreate(int sampleId, IFormFile file)
    {
        if (file == null)
            return BadRequest("No file uploaded");

        var sample = await _context.Samples.FindAsync(sampleId);

        if (sample == null)
            return NotFound("Sample not found");

        var json = await _ocr.ExtractTextAsync(file);
        var content = _ocr.GetContentFromAzureJson(json);

        var analyses = _ocr.ParseLabReport(content, sampleId);

        if (!analyses.Any())
            return BadRequest("No analyses detected in document");

        _context.Analyses.AddRange(analyses);

        sample.Status = "In Analysis";

        await _context.SaveChangesAsync();

        return Ok(analyses);
    }
}