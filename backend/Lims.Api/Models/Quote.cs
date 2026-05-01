namespace Lims.Api.Models;

public class Quote
{
    public int Id { get; set; }
    public string Code { get; set; } = $"DEV-{Guid.NewGuid().ToString()[..6]}";

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Draft";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}