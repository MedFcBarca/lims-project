using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Services;

public class BatchService
{
    private readonly AppDbContext _context;

    public BatchService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Batch> CreateBatchAsync(CreateBatchDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);

        if (client == null)
            throw new Exception("Client not found");

        var batch = new Batch
        {
            Code = dto.Code,
            ClientId = dto.ClientId,
            Status = "Received",
            ReceivedAt = DateTime.UtcNow
        };

        _context.Batches.Add(batch);
        await _context.SaveChangesAsync();

        return batch;
    }

    public async Task<object> ValidateBatchAsync(int id)
    {
        var batch = await _context.Batches
            .Include(b => b.Samples)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (batch == null)
            throw new Exception("Batch not found");

        if (!batch.Samples.Any())
            throw new Exception("No samples found in this batch");

        if (batch.Samples.Any(s => s.Status == "Received" || s.Status == "InProgress"))
            throw new Exception("All samples must be completed before validating batch");

        foreach (var sample in batch.Samples)
        {
            if (sample.Status == "Validated" || sample.Status == "Rejected")
                continue;

            var analyses = await _context.Analyses
                .Where(a => a.SampleId == sample.Id)
                .ToListAsync();

            if (!analyses.Any())
                continue;

            var hasNonCompliant = analyses.Any(a => !a.IsCompliant);

            sample.Status = hasNonCompliant ? "Rejected" : "Validated";
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

        return new
        {
            message = "Batch validated successfully",
            batch.Status
        };
    }
}