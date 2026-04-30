using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Services;

public class SampleService
{
    private readonly AppDbContext _context;

    public SampleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> CreateSampleAsync(CreateSampleDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);

        if (client == null)
            throw new Exception("Client not found");

        var batch = await _context.Batches.FindAsync(dto.BatchId);

        if (batch == null)
            throw new Exception("Batch not found");

        var sample = new Sample
        {
            Code = dto.Code,
            Type = dto.Type,
            Status = dto.Status,
            ClientId = dto.ClientId,
            BatchId = dto.BatchId
        };

        _context.Samples.Add(sample);

        batch.Status = "InProgress";

        await _context.SaveChangesAsync();

        return new
        {
            sample.Id,
            sample.Code,
            sample.Type,
            sample.Status,
            sample.ClientId,
            sample.BatchId,
            sample.CreatedAt
        };
    }

    public async Task<Sample> CompleteSampleAsync(int id)
    {
        var sample = await _context.Samples.FindAsync(id);

        if (sample == null)
            throw new Exception("Sample not found");

        var analyses = await _context.Analyses
            .Where(a => a.SampleId == id)
            .ToListAsync();

        if (!analyses.Any())
            throw new Exception("No analyses found");

        sample.Status = "Completed";

        await _context.SaveChangesAsync();

        return sample;
    }

    public async Task<Sample> ValidateSampleAsync(int id)
    {
        var sample = await _context.Samples.FindAsync(id);

        if (sample == null)
            throw new Exception("Sample not found");

        if (sample.Status != "Completed")
            throw new Exception("Sample must be completed before validation");

        var analyses = await _context.Analyses
            .Where(a => a.SampleId == id)
            .ToListAsync();

        if (!analyses.Any())
            throw new Exception("No analyses found");

        var hasNonCompliant = analyses.Any(a => !a.IsCompliant);

        sample.Status = hasNonCompliant ? "Rejected" : "Validated";

        await _context.SaveChangesAsync();

        return sample;
    }
}