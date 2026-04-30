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
    private readonly AnalysisService _analysisService;

    public AnalysesController(AppDbContext context, AnalysisService analysisService)
    {
        _context = context;
        _analysisService = analysisService;
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
    public async Task<IActionResult> CreateAnalysis(CreateAnalysisDto dto)
    {
        try
        {
            var result = await _analysisService.CreateAnalysisAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAnalysis(int id, CreateAnalysisDto dto)
    {
        try
        {
            await _analysisService.UpdateAnalysisAsync(id, dto);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _analysisService.DeleteAnalysisAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}