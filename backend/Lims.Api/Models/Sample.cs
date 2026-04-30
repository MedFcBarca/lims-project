namespace Lims.Api.Models;

public class Sample
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "Received";

    public int ClientId { get; set; }

    public int BatchId { get; set; }
    public Batch Batch { get; set; } = null!;
    public Client Client { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}