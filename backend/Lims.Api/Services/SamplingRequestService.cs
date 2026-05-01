using Lims.Api.Data;
using Lims.Api.DTOs;
using Lims.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lims.Api.Services;

public class SamplingRequestService
{
    private readonly AppDbContext _context;

    public SamplingRequestService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SamplingRequest> CreateAsync(CreateSamplingRequestDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);

        if (client == null)
            throw new Exception("Client not found");

        var request = new SamplingRequest
        {
            Code = dto.Code,
            SampleType = dto.SampleType,
            Location = dto.Location,
            RequestedDate = dto.RequestedDate,
            ClientId = dto.ClientId,
            Status = "Requested"
        };

        _context.SamplingRequests.Add(request);
        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<SamplingRequest> PlanAsync(int id, PlanSamplingRequestDto dto)
    {
        var request = await _context.SamplingRequests.FindAsync(id);

        if (request == null)
            throw new Exception("Sampling request not found");

        if (request.Status != "Requested")
            throw new Exception("Only requested sampling can be planned");

        request.PlannedDate = dto.PlannedDate;
        request.AssignedTechnician = dto.AssignedTechnician;
        request.Status = "Planned";

        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<SamplingRequest> MarkAsCollectedAsync(int id)
    {
        var request = await _context.SamplingRequests.FindAsync(id);

        if (request == null)
            throw new Exception("Sampling request not found");

        if (request.Status != "Planned")
            throw new Exception("Sampling must be planned before collection");

        request.Status = "Collected";

        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<object> CreateSampleFromRequestAsync(int id, CreateSampleFromSamplingRequestDto dto)
    {
        var request = await _context.SamplingRequests.FindAsync(id);

        if (request == null)
            throw new Exception("Sampling request not found");

        if (request.Status != "Collected")
            throw new Exception("Sampling must be collected before creating sample");

        var batch = await _context.Batches.FindAsync(dto.BatchId);

        if (batch == null)
            throw new Exception("Batch not found");

        var sample = new Sample
        {
            Code = dto.SampleCode,
            Type = request.SampleType,
            Status = "Received",
            ClientId = request.ClientId,
            BatchId = dto.BatchId,
            SamplingRequestId = request.Id
        };

        _context.Samples.Add(sample);

        batch.Status = "InProgress";

        await _context.SaveChangesAsync();

        request.SampleId = sample.Id;
        request.Status = "SampleCreated";

        await _context.SaveChangesAsync();

        return new
        {
            message = "Sample created from sampling request",
            sample.Id,
            sample.Code,
            sample.Type,
            sample.Status,
            sample.ClientId,
            sample.BatchId,
            samplingRequestId = request.Id
        };
    }

    public async Task<SamplingRequest> CancelAsync(int id)
{
    var request = await _context.SamplingRequests.FindAsync(id);

    if (request == null)
        throw new Exception("Sampling request not found");

    if (request.Status == "SampleCreated")
        throw new Exception("Cannot cancel a request after sample creation");

    request.Status = "Cancelled";

    await _context.SaveChangesAsync();

    return request;
}
}