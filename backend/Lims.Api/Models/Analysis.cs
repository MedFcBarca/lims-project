namespace Lims.Api.Models;

public class Analysis
{
    public int Id { get; set; }

    public string Parameter { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public double Threshold { get; set; }

    public bool IsCompliant { get; set; }

    public int SampleId { get; set; }
    public Sample Sample { get; set; } = null!;
    public int? StockItemId { get; set; }
    public StockItem? StockItem { get; set; }
}