using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SamplingRequestsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly SamplingRequestService _service;

    public SamplingRequestsController(AppDbContext context, SamplingRequestService service)
    {
        _context = context;
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _context.SamplingRequests
            .Include(r => r.Client)
            .Include(r => r.Sample)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(requests);
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateSamplingRequestDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost("{id:int}/plan")]
    public async Task<IActionResult> Plan(int id, PlanSamplingRequestDto dto)
    {
        try
        {
            var result = await _service.PlanAsync(id, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost("{id:int}/collect")]
    public async Task<IActionResult> Collect(int id)
    {
        try
        {
            var result = await _service.MarkAsCollectedAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost("{id:int}/create-sample")]
    public async Task<IActionResult> CreateSample(int id, CreateSampleFromSamplingRequestDto dto)
    {
        try
        {
            var result = await _service.CreateSampleFromRequestAsync(id, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var result = await _service.CancelAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}