using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Lims.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SamplesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly SampleService _sampleService;
    private readonly PdfReportService _pdfReportService;

    public SamplesController(
        AppDbContext context,
        SampleService sampleService,
        PdfReportService pdfReportService)
    {
        _context = context;
        _sampleService = sampleService;
        _pdfReportService = pdfReportService;
    }

    [HttpGet]
public async Task<IActionResult> GetSamples()
{
    var samples = await _context.Samples
        .Include(s => s.Client)
        .Include(s => s.Batch)
        .OrderByDescending(s => s.CreatedAt)
        .Select(s => new
        {
            s.Id,
            s.Code,
            s.Type,
            s.Status,
            s.ClientId,
            Client = new
            {
                s.Client.Id,
                s.Client.Name,
                s.Client.Email,
                s.Client.Domain
            },
            s.BatchId,
            Batch = new
            {
                s.Batch.Id,
                s.Batch.Code
            },
            s.SamplingRequestId,
            SamplingRequestCode = _context.SamplingRequests
                .Where(r => r.Id == s.SamplingRequestId)
                .Select(r => r.Code)
                .FirstOrDefault(),
            s.CreatedAt
        })
        .ToListAsync();

    return Ok(samples);
}

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost]
    public async Task<IActionResult> CreateSample(CreateSampleDto dto)
    {
        try
        {
            var result = await _sampleService.CreateSampleAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> CompleteSample(int id)
    {
        try
        {
            var sample = await _sampleService.CompleteSampleAsync(id);
            return Ok(sample);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Validator")]
    [HttpPost("{id:int}/validate")]
    public async Task<IActionResult> ValidateSample(int id)
    {
        try
        {
            var sample = await _sampleService.ValidateSampleAsync(id);
            return Ok(sample);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
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