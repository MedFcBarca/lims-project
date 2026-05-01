namespace Lims.Api.Models;

public class Invoice
{
    public int Id { get; set; }

    public string Code { get; set; } = $"INV-{Guid.NewGuid().ToString()[..6]}";

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public int AnalysesCount { get; set; }

    public string Status { get; set; } = "Generated";

    public int BatchId { get; set; }
    public Batch Batch { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<InvoiceLine> Lines { get; set; } = new();
}