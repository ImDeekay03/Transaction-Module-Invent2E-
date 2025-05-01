namespace Transaction_Module__Invent2E_.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; } // Foreign key to Order
        public decimal AmountReceived { get; set; }
        public decimal BankCharges { get; set; }
        public string PaymentMethod { get; set; } // e.g., Cash, Credit Card, Bank Transfer
        public string DepositTo { get; set; } // e.g., Bank Name, Cash Register
        public DateTime PaymentDate { get; set; }
        public string AttachmentPath { get; set; }
    }
}
