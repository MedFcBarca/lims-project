using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Services;

public class AnalysisService
{
    private readonly AppDbContext _context;
    private readonly AuditService _audit;

    public AnalysisService(AppDbContext context, AuditService audit)
    {
        _context = context;
        _audit = audit;
    }

    public async Task<object> CreateAnalysisAsync(CreateAnalysisDto dto)
    {
        var sample = await _context.Samples.FindAsync(dto.SampleId);

        if (sample == null)
            throw new Exception("Sample not found");

        StockItem? stock = null;

        if (dto.StockItemId != null)
        {
            stock = await _context.StockItems.FindAsync(dto.StockItemId);

            if (stock == null)
                throw new Exception("Stock item not found");

            if (stock.Quantity <= 0)
                throw new Exception("Out of stock");

            if (stock.ExpirationDate < DateTime.UtcNow)
                throw new Exception("Stock expired");
        }

        var analysis = new Analysis
        {
            Parameter = dto.Parameter,
            Value = dto.Value,
            Unit = dto.Unit,
            Threshold = dto.Threshold,
            IsCompliant = dto.Value <= dto.Threshold,
            SampleId = dto.SampleId,
            StockItemId = dto.StockItemId
        };

        _context.Analyses.Add(analysis);

        if (stock != null)
            stock.Quantity -= 1;

        sample.Status = "InProgress";

        var batch = await _context.Batches.FindAsync(sample.BatchId);

        if (batch != null)
            batch.Status = "InProgress";

        await _context.SaveChangesAsync();

        await _audit.LogAsync(
            action: "AnalysisCreated",
            entity: "Analysis",
            entityId: analysis.Id,
            sampleId: analysis.SampleId,
            displayName: analysis.Parameter,
            newValue: $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}",
            comment: stock == null
                ? "Création analyse"
                : $"Création analyse avec stock {stock.Name} / lot {stock.LotNumber}"
        );

        return new
        {
            analysis.Id,
            analysis.Parameter,
            analysis.Value,
            analysis.Unit,
            analysis.Threshold,
            analysis.IsCompliant,
            analysis.SampleId,
            analysis.StockItemId
        };
    }

    public async Task UpdateAnalysisAsync(int id, CreateAnalysisDto dto)
    {
        var analysis = await _context.Analyses
            .Include(a => a.Sample)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (analysis == null)
            throw new Exception("Analysis not found");

        var oldValue = $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}";

        var sample = await _context.Samples.FindAsync(dto.SampleId);

        if (sample == null)
            throw new Exception("Sample not found");

        StockItem? stock = null;

        if (dto.StockItemId != null && dto.StockItemId != analysis.StockItemId)
        {
            stock = await _context.StockItems.FindAsync(dto.StockItemId);

            if (stock == null)
                throw new Exception("Stock item not found");

            if (stock.Quantity <= 0)
                throw new Exception("Out of stock");

            if (stock.ExpirationDate < DateTime.UtcNow)
                throw new Exception("Stock expired");

            stock.Quantity -= 1;
        }

        analysis.Parameter = dto.Parameter;
        analysis.Value = dto.Value;
        analysis.Unit = dto.Unit;
        analysis.Threshold = dto.Threshold;
        analysis.SampleId = dto.SampleId;
        analysis.StockItemId = dto.StockItemId;
        analysis.IsCompliant = dto.Value <= dto.Threshold;

        sample.Status = "InProgress";

        var batch = await _context.Batches.FindAsync(sample.BatchId);

        if (batch != null)
            batch.Status = "InProgress";

        await _context.SaveChangesAsync();

        var newValue = $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}";

        await _audit.LogAsync(
            action: "AnalysisUpdated",
            entity: "Analysis",
            entityId: analysis.Id,
            sampleId: analysis.SampleId,
            displayName: analysis.Parameter,
            oldValue: oldValue,
            newValue: newValue,
            comment: "Modification analyse"
        );
    }

    public async Task DeleteAnalysisAsync(int id)
    {
        var analysis = await _context.Analyses
            .Include(a => a.Sample)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (analysis == null)
            throw new Exception("Analysis not found");

        var oldValue = $"{analysis.Parameter} = {analysis.Value} {analysis.Unit}";

        analysis.Sample.Status = "InProgress";

        var batch = await _context.Batches.FindAsync(analysis.Sample.BatchId);

        if (batch != null)
            batch.Status = "InProgress";

        _context.Analyses.Remove(analysis);
        await _context.SaveChangesAsync();

        await _audit.LogAsync(
            action: "AnalysisDeleted",
            entity: "Analysis",
            entityId: id,
            sampleId: analysis.SampleId,
            displayName: analysis.Parameter,
            oldValue: oldValue,
            comment: "Suppression analyse"
        );
    }
}