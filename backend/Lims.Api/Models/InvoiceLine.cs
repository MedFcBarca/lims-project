namespace Lims.Api.Models;

public class InvoiceLine
{
    public int Id { get; set; }

    public int InvoiceId { get; set; }

    public Invoice Invoice { get; set; } = null!; 

    public string Description { get; set; } = string.Empty; 

    public decimal Price { get; set; }
}