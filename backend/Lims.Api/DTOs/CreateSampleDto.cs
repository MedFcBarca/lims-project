namespace Lims.Api.DTOs;

public class CreateSampleDto
{
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "Received";
    public int ClientId { get; set; }
}