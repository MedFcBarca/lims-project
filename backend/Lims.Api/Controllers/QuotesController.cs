using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Lims.Api.Services;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly QuotePdfService _quotePdfService;

    public QuotesController(AppDbContext context, QuotePdfService quotePdfService)
    {
        _context = context;
        _quotePdfService = quotePdfService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuote(CreateQuoteDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);

        if (client == null)
            return BadRequest("Client not found");

        var quote = new Quote
        {
            ClientId = dto.ClientId,
            TotalAmount = dto.TotalAmount,
            Status = dto.Status
        };

        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            quote.Id,
            quote.Code,
            quote.ClientId,
            quote.TotalAmount,
            quote.Status,
            quote.CreatedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetQuotes()
    {
        var quotes = await _context.Quotes
            .Include(q => q.Client)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => new
            {
                q.Id,
                q.Code,
                q.TotalAmount,
                q.Status,
                q.CreatedAt,
                Client = new
                {
                    q.Client.Id,
                    q.Client.Name,
                    q.Client.Email,
                    q.Client.Domain
                }
            })
            .ToListAsync();

        return Ok(quotes);
    }

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> DownloadQuotePdf(int id)
    {
        try
        {
            var pdfBytes = await _quotePdfService.GenerateQuotePdfAsync(id);

            return File(
                pdfBytes,
                "application/pdf",
                $"quote-{id}.pdf"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}