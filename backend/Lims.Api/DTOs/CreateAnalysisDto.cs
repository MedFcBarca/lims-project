namespace Lims.Api.DTOs;

public class CreateAnalysisDto
{
    public string Parameter { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public double Threshold { get; set; }
    public int SampleId { get; set; }
    public int? StockItemId { get; set; }
}