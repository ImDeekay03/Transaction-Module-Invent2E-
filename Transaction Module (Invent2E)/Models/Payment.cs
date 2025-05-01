using System;
using Microsoft.AspNetCore.Http;

namespace Transaction_Module__Invent2E_.Models
{
    public class Payment
    {
        public int PaymentId { get; set; } // Unique identifier, e.g. "PAY-001"
        public int InvoiceId { get; set; } // Referenced to invoice (e.g., "#INV-001")
        public int OrderId { get; set; } // Link to the corresponding order

        public decimal AmountReceived { get; set; } // User-input amount received
        public decimal BankCharges { get; set; } // Optional bank charge
        public string PaymentMethod { get; set; } // e.g., "GCash", "Bank Transfer", "Cash"
        public string DepositTo {  get; set; } //e.g., "BDO Savings", "GCash Wallet"

        public List<PaymentFile> Attachments { get; set; } = new List<PaymentFile>(); // List of uploaded files

        public DateTime PaymentDate { get; set; } = DateTime.Now; // Default to current
        public string Notes { get; set; } // Optional notes field
    }

    public class PaymentFile
    {
        public string FileName { get; set; } // Name of the file
        public string FilePath { get; set; } // Path to the file
        public long FileSize { get; set; } // Size of the file in bytes
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
