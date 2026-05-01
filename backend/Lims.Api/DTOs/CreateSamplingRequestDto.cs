namespace Lims.Api.DTOs;

public class CreateSamplingRequestDto
{
    public string Code { get; set; } = string.Empty;
    public string SampleType { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime RequestedDate { get; set; }
    public int ClientId { get; set; }
}