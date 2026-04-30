namespace Lims.Api.Models;

public class Batch
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty; // LOT-001

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Received";

    public List<Sample> Samples { get; set; } = new();
}