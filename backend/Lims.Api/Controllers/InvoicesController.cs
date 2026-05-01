using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lims.Api.Data;
using Lims.Api.Models;
using Lims.Api.Services;

namespace Lims.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly InvoicePdfService _invoicePdfService;

    public InvoicesController(AppDbContext context, InvoicePdfService invoicePdfService)
    {
        _context = context;
        _invoicePdfService = invoicePdfService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice(int batchId)
    {
        var invoiceExists = await _context.Invoices
            .AnyAsync(i => i.BatchId == batchId);

        if (invoiceExists)
            return BadRequest("Invoice already exists for this batch");

        var batch = await _context.Batches
            .Include(b => b.Samples)
            .FirstOrDefaultAsync(b => b.Id == batchId);

        if (batch == null)
            return NotFound("Batch not found");

        if (!batch.Samples.Any())
            return BadRequest("No samples found in this batch");

        var sampleIds = batch.Samples.Select(s => s.Id).ToList();

        var analyses = await _context.Analyses
            .Where(a => sampleIds.Contains(a.SampleId))
            .ToListAsync();

        if (!analyses.Any())
            return BadRequest("No analyses found for this batch");

        var lines = analyses.Select(a => new InvoiceLine
        {
            Description = $"{a.Parameter} analysis",
            Price = 50m
        }).ToList();

        var total = lines.Sum(l => l.Price);

        var invoice = new Invoice
        {
            BatchId = batch.Id,
            ClientId = batch.Samples.First().ClientId,
            TotalAmount = total,
            AnalysesCount = analyses.Count,
            Status = "Generated",
            Lines = lines
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            invoice.Id,
            invoice.Code,
            invoice.BatchId,
            invoice.ClientId,
            invoice.TotalAmount,
            invoice.AnalysesCount,
            invoice.Status,
            invoice.CreatedAt,
            Lines = invoice.Lines.Select(l => new
            {
                l.Description,
                l.Price
            })
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetInvoices()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Client)
            .Include(i => i.Batch)
            .Include(i => i.Lines)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                i.Code,
                i.TotalAmount,
                i.AnalysesCount,
                i.Status,
                i.CreatedAt,
                Client = new
                {
                    i.Client.Id,
                    i.Client.Name,
                    i.Client.Email,
                    i.Client.Domain
                },
                Batch = new
                {
                    i.Batch.Id,
                    i.Batch.Code,
                    i.Batch.Status
                },
                Lines = i.Lines.Select(l => new
                {
                    l.Description,
                    l.Price
                })
            })
            .ToListAsync();

        return Ok(invoices);
    }

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> DownloadInvoicePdf(int id)
    {
        try
        {
            var pdfBytes = await _invoicePdfService.GenerateInvoicePdfAsync(id);

            return File(
                pdfBytes,
                "application/pdf",
                $"invoice-{id}.pdf"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}