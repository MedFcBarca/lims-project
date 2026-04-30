using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Lims.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditService _audit;

    public AnalysesController(AppDbContext context, AuditService audit)
    {
        _context = context;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<Analysis>>> GetAnalyses()
    {
        var analyses = await _context.Analyses
            .Include(a => a.Sample)
            .ThenInclude(s => s.Client)
            .ToListAsync();

        return Ok(analyses);
    }

    [HttpPost]
    public async Task<ActionResult<Analysis>> CreateAnalysis(CreateAnalysisDto dto)
    {
        var sample = await _context.Samples.FindAsync(dto.SampleId);

        if (sample == null)
            return BadRequest("Sample not found");

        var analysis = new Analysis
        {
            Parameter = dto.Parameter,
            Value = dto.Value,
            Unit = dto.Unit,
            Threshold = dto.Threshold,
            IsCompliant = dto.Value <= dto.Threshold,
            SampleId = dto.SampleId
        };

        _context.Analyses.Add(analysis);

        sample.Status = "InProgress";

        await _context.SaveChangesAsync();

        await _audit.LogAsync(
        action: "AnalysisCreated",
        entity: "Analysis",
        entityId: analysis.Id,
        sampleId: analysis.SampleId,
        displayName: analysis.Parameter,
        newValue: $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}",
        comment: "Création analyse"
);

        return Ok(analysis);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAnalysis(int id, CreateAnalysisDto dto)
    {
        var analysis = await _context.Analyses.FindAsync(id);

        if (analysis == null)
            return NotFound();

        var oldValue = $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}";

        var sample = await _context.Samples.FindAsync(dto.SampleId);

        if (sample == null)
            return BadRequest("Sample not found");

        analysis.Parameter = dto.Parameter;
        analysis.Value = dto.Value;
        analysis.Unit = dto.Unit;
        analysis.Threshold = dto.Threshold;
        analysis.SampleId = dto.SampleId;

        analysis.IsCompliant = dto.Value <= dto.Threshold;
        
        sample.Status = "InProgress";

        await _context.SaveChangesAsync();

        var newValue = $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}";

        await _audit.LogAsync(
        action: "AnalysisUpdated",
        entity: "Analysis",
        entityId: analysis.Id,
        sampleId: analysis.SampleId,
        displayName: analysis.Parameter,
        oldValue: oldValue,
        newValue: newValue,
        comment: "Modification analyse"
);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var analysis = await _context.Analyses
            .Include(a => a.Sample)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (analysis == null)
            return NotFound();

        var oldValue = $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}";

        analysis.Sample.Status = "InProgress";

        _context.Analyses.Remove(analysis);
        await _context.SaveChangesAsync();

        await _audit.LogAsync(
        action: "AnalysisDeleted",
        entity: "Analysis",
        entityId: id,
        sampleId: analysis.SampleId,
        displayName: analysis.Parameter,
        oldValue: oldValue,
        comment: "Suppression analyse"
);

        return NoContent();
    }
}