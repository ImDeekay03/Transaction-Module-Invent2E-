using System;
using System.Collections.Generic;

namespace Transaction_Module__Invent2E_.Models.ViewModels
{
    public class InvoiceViewModel
    {
        // Invoice Info
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }

        // Payment Details
        public string PaymentMethod { get; set; }
        public string DepositTo { get; set; }

        // Order Info
        public int OrderId { get; set; }
        public string CustomerName { get; set; }

        // Product Table
        public List<InvoiceProductDetail> ProductDetails { get; set; }

        // Totals
        public decimal SubTotal { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class InvoiceProductDetail
    {
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Tax {  get; set; }
        public decimal SubTotal => (Rate * Quantity) + Tax;
    }
}
