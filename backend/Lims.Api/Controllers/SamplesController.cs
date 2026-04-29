using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Lims.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SamplesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PdfReportService _pdfReportService;

    public SamplesController(AppDbContext context, PdfReportService pdfReportService)
    {
        _context = context;
        _pdfReportService = pdfReportService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Sample>>> GetSamples()
    {
        var samples = await _context.Samples
            .Include(s => s.Client)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(samples);
    }

    [HttpPost]
    public async Task<ActionResult<Sample>> CreateSample(CreateSampleDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);

        if (client == null)
            return BadRequest("Client not found");

        var sample = new Sample
        {
            Code = dto.Code,
            Type = dto.Type,
            Status = dto.Status,
            ClientId = dto.ClientId
        };

        _context.Samples.Add(sample);
        await _context.SaveChangesAsync();

        return Ok(sample);
    }

    [HttpPost("{id:int}/validate")]
    public async Task<IActionResult> ValidateSample(int id)
    {
        var sample = await _context.Samples.FindAsync(id);

        if (sample == null)
            return NotFound();

        var analyses = await _context.Analyses
            .Where(a => a.SampleId == id)
            .ToListAsync();

        if (!analyses.Any())
            return BadRequest("No analyses found");

        var hasNonCompliant = analyses.Any(a => !a.IsCompliant);

        sample.Status = hasNonCompliant ? "Rejected" : "Validated";

        await _context.SaveChangesAsync();

        return Ok(sample);
    }

    [HttpGet("{id:int}/report")]
    public async Task<IActionResult> DownloadReport(int id, [FromQuery] string language = "fr")
    {
        var sample = await _context.Samples
            .Include(s => s.Client)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sample == null)
            return NotFound();

        var analyses = await _context.Analyses
            .Where(a => a.SampleId == id)
            .ToListAsync();

        if (!analyses.Any())
            return BadRequest("No analyses found for this sample");

        var pdfBytes = await _pdfReportService.GenerateSampleReportAsync(sample, analyses, language);

        return File(
            pdfBytes,
            "application/pdf",
            $"sample-{sample.Code}-report-{language}.pdf"
        );
    }
}