namespace Transaction_Module__Invent2E_.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } // e.g., Pending, Completed, Cancelled
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
