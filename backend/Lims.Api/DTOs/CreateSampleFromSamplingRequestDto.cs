namespace Lims.Api.DTOs;

public class CreateSampleFromSamplingRequestDto
{
    public string SampleCode { get; set; } = string.Empty;
    public int BatchId { get; set; }
}