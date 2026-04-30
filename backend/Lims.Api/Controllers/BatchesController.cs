using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BatchesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BatchesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
public async Task<IActionResult> GetAll()
{
    var batches = await _context.Batches
        .Include(b => b.Client)
        .Include(b => b.Samples)
        .OrderByDescending(b => b.ReceivedAt)
        .Select(b => new
        {
            b.Id,
            b.Code,
            b.ClientId,
            Client = new
            {
                b.Client.Id,
                b.Client.Name,
                b.Client.Email,
                b.Client.Domain
            },
            b.ReceivedAt,
            b.Status,
            SamplesCount = b.Samples.Count
        })
        .ToListAsync();

    return Ok(batches);
}

    [HttpPost]
    public async Task<ActionResult<Batch>> Create(CreateBatchDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);

        if (client == null)
            return BadRequest("Client not found");

        var batch = new Batch
        {
            Code = dto.Code,
            ClientId = dto.ClientId,
            Status = "Received",
            ReceivedAt = DateTime.UtcNow
        };

        _context.Batches.Add(batch);
        await _context.SaveChangesAsync();

        return Ok(batch);
    }

[HttpPost("{id:int}/validate")]
public async Task<IActionResult> ValidateBatch(int id)
{
    var batch = await _context.Batches
        .Include(b => b.Samples)
        .FirstOrDefaultAsync(b => b.Id == id);

    if (batch == null)
        return NotFound();

    if (!batch.Samples.Any())
        return BadRequest("No samples found in this batch");

    // regle metier : tous les samples doivent être Completed
    if (batch.Samples.Any(s => s.Status == "Received" || s.Status == "InProgress"))
        return BadRequest("All samples must be completed before validating batch");

    foreach (var sample in batch.Samples)
    {
        var analyses = await _context.Analyses
            .Where(a => a.SampleId == sample.Id)
            .ToListAsync();

        if (!analyses.Any())
            continue;

        var hasNonCompliant = analyses.Any(a => !a.IsCompliant);

        sample.Status = hasNonCompliant
            ? "Rejected"
            : "Validated";
    }

    var hasRejectedSample = batch.Samples.Any(s => s.Status == "Rejected");
    var allValidated = batch.Samples.All(s => s.Status == "Validated");

    if (hasRejectedSample)
        batch.Status = "Rejected";
    else if (allValidated)
        batch.Status = "Validated";
    else
        batch.Status = "InProgress";

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Batch validated successfully",
        batch.Status
    });
}
}