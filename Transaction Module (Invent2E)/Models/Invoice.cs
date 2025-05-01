using System;
using System.Collections.Generic;

namespace Transaction_Module__Invent2E_.Models
{
    public class Invoice
    {
        public int InvoiceId { get; set; } // Auto-generated when payment is recorded
        public string InvoiceNumber { get; set; } // e.g., "INV-001"

        public int OrderId { get; set; }
        public string OrderNumber { get; set; }

        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }

        public string PaymentMethod { get; set; } // e.g., "GCASH"
        public string DepositTo { get; set; } // Optional account field

        public decimal AmountReceived { get; set; } // Actual amount received
        public decimal BankCharges { get; set; } // Additional fees
        public decimal Subtotal { get; set; } // Sum of product subtotals
        public decimal Total => Subtotal + BankCharges; // Calculated property

        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string ShippingAddress { get; set; }

        public virtual List<InvoiceProductDetail> Products { get; set; } = new List<InvoiceProductDetail>();

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        }
    public class InvoiceProductDetail
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } // e.g., "Men Cotton Polo Shirt
        public string SKU { get; set; } // e.g., "ADDS-GRN-22"
        public string Size { get; set; } //Optional: "S"
        public int Quantity { get; set; } // e.g., 2
        public decimal Rate { get; set; } // e.g., 120
        public decimal TaxPercentage { get; set; } //e.g., 50
        public decimal Subtotal => Quantity * Rate * (1 + (TaxPercentage / 100)); // e.g., 2 * 120 * 1.5
    }
}
