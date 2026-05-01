using Lims.Api.Data;
using Lims.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly AppDbContext _context;

    public StockController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stockItems = await _context.StockItems
            .OrderBy(s => s.ExpirationDate)
            .ToListAsync();

        return Ok(stockItems);
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPost]
    public async Task<IActionResult> Create(StockItem item)
    {
        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest("Name is required");

        if (string.IsNullOrWhiteSpace(item.LotNumber))
            return BadRequest("Lot number is required");

        if (item.Quantity < 0)
            return BadRequest("Quantity cannot be negative");

        _context.StockItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, StockItem updatedItem)
    {
        var item = await _context.StockItems.FindAsync(id);

        if (item == null)
            return NotFound();

        item.Name = updatedItem.Name;
        item.LotNumber = updatedItem.LotNumber;
        item.Quantity = updatedItem.Quantity;
        item.ExpirationDate = updatedItem.ExpirationDate;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.StockItems.FindAsync(id);

        if (item == null)
            return NotFound();

        _context.StockItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}