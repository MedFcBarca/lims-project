namespace Lims.Api.Models;

public class SamplingRequest
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;
    public string SampleType { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
    public DateTime? PlannedDate { get; set; }

    public string? AssignedTechnician { get; set; }

    public string Status { get; set; } = "Requested";
    // Requested, Planned, Collected, SampleCreated, Cancelled

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public int? SampleId { get; set; }
    public Sample? Sample { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}