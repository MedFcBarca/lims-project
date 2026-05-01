namespace Lims.Api.DTOs;

public class CreateQuoteDto
{
    public int ClientId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Draft";
}