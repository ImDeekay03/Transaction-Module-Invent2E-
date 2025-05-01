using System;
using System.Collections.Generic;

namespace Transaction_Module__Invent2E_.Models.ViewModels
{
    public class OrderViewModel
    {
        public int OrderId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerContact { get; set; }

        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } // e.g., "Pending", "Completed"

        // Payment Details (may be null if unpaid)
        public string PaymentStatus { get; set; }
        public string PaymentMethod { get; set; }

        // Display data
        public string OrderSource { get; set; }
        public string ShippingAddress { get; set; }

        // Products in the order
        public List<OrderItemViewModel> Items { get; set; }

        public decimal SubTotal { get; set; }
        public decimal TotalTax { get; set; }
        public decimal TotalAmount { get; set; }

        // Optional notes or comments
        public string OrderNotes { get; set; }
    }

    public class OrderItemViewModel
    {
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Tax { get; set; }

        public decimal LineTotal => (Rate * Quantity) + Tax;
    }
}
