using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BatchesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly BatchService _batchService;

    public BatchesController(AppDbContext context, BatchService batchService)
    {
        _context = context;
        _batchService = batchService;
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
    public async Task<IActionResult> Create(CreateBatchDto dto)
    {
        try
        {
            var batch = await _batchService.CreateBatchAsync(dto);
            return Ok(batch);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:int}/validate")]
    public async Task<IActionResult> ValidateBatch(int id)
    {
        try
        {
            var result = await _batchService.ValidateBatchAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}