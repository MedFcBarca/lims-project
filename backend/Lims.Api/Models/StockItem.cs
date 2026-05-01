public class StockItem
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string LotNumber { get; set; } = null!;
    public int Quantity { get; set; }
    public DateTime ExpirationDate { get; set; }
}