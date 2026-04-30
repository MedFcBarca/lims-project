namespace Lims.Api.DTOs;

public class CreateBatchDto
{
    public string Code { get; set; } = string.Empty;
    public int ClientId { get; set; }
}