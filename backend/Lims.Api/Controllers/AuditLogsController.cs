using Lims.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("entity/{entityName}/{entityId:int}")]
    public async Task<IActionResult> GetByEntity(string entityName, int entityId)
    {
        var logs = await _context.AuditLogs
            .Where(x => x.EntityName == entityName && x.EntityId == entityId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(logs);
    }
}