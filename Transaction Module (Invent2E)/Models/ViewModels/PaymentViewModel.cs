using System;

namespace Transaction_Module__Invent2E_.Models.ViewModels
{
    public class PaymentViewModel
    {
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }

        public string CustomerName { get; set; }

        public DateTime PaymentDate { get; set; }
        public decimal AmountReceived { get; set; }
        public decimal BankCharges { get; set; }
        public decimal NetAmount => AmountReceived - BankCharges;

        public string PaymentMethod { get; set; }
        public string DepositTo { get; set; }

        public string AttachmentFileName { get; set; }
        public string PaymentStatus { get; set; }

        // For displaying purposes (optional)
        public string OrderReference { get; set; }
        public decimal TotalDue { get; set; }
    }
}
