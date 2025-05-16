using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TransactionF.Models
{
    /// <summary>
    /// Represents an order in the system.
    /// Integration Note: This model is used by the Orders module and expects data from:
    /// - Customers module (CustomerID)
    /// - Products module (via OrderItems)
    /// - Payment module (PaymentMethod, PaymentDate)
    /// </summary>
    public class Order
    {
        public int OrderID { get; set; }
        public DateTime OrderDate { get; set; }
        public int CustomerID { get; set; } // Integration Point: Maps to Customers module's Customer ID
        public string ShippingAddress { get; set; } // Integration Point: Should be populated from Customers module
        public decimal OrderTotal { get; set; }
        public bool IsPaid { get; set; }
        public string PaymentMethod { get; set; } // Integration Point: Should be populated from Payment module
        public DateTime? PaymentDate { get; set; } // Integration Point: Should be populated from Payment module
        public string ReferenceNumber { get; set; } // Integration Point: Should be populated from Payment module
        public required string Status { get; set; }
        public List<OrderItem> OrderItems { get; set; }

        // New fields based on website functionality
        public string OrderSource { get; set; } // Integration Point: Could be populated from multiple modules (e.g., "Website", "Mobile App", "POS")
        public string Location { get; set; } // Integration Point: Could be populated from Inventory module
        public string TrackingNumber { get; set; } // Integration Point: Should be populated from Shipping module
        public string TrackingProvider { get; set; } // Integration Point: Should be populated from Shipping module
        public int ProgressPercentage { get; set; } // Calculated field based on Status
        public List<OrderStatusHistory> StatusHistory { get; set; }

        [NotMapped]
        public decimal? PaymentAmount { get; set; } // For payment input only

        public Order()
        {
            StatusHistory = [];
            OrderItems = [];
            ShippingAddress = string.Empty;
            PaymentMethod = string.Empty;
            OrderSource = string.Empty;
            ReferenceNumber = string.Empty;
            Status = "New";
            Location = string.Empty;
            TrackingNumber = string.Empty;
            TrackingProvider = string.Empty;
        }
    }

    /// <summary>
    /// Tracks the history of status changes for an order.
    /// Integration Note: This model is used internally by the Orders module but can be
    /// populated by other modules when they change the order status.
    /// </summary>
    public class OrderStatusHistory
    {
        public int Id { get; set; }
        public int OrderID { get; set; }
        public string? Status { get; set; }
        public DateTime StatusDate { get; set; }
        public string? Notes { get; set; }
        public Order? Order { get; set; }
    }
}