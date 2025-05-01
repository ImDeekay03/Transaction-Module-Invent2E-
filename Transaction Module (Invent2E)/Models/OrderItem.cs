namespace Transaction_Module__Invent2E_.Models
{
    public class OrderItem
    {
        public int OrderItemID { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Tax { get; set; }
        public decimal Subtotal => (Rate * Quantity) + Tax;
    }
}
