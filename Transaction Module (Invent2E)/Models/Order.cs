namespace Transaction_Module__Invent2E_.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public string PaymentStatus { get; set; } // e.g., Unpaid, Paid
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } // e.g., Pending, Completed, Cancelled

        // Navigation properties
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public string OrderStatus { get; internal set; }
    }
}
