using System;
using System.Collections.Generic;
using System.Linq;
using Transaction_Module__Invent2E_.Models;

namespace Transaction_Module__Invent2E_.Services.Implementations
{
    public class PaymentService
    {
        private static List<Payment> _payments = new List<Payment>();
        private static int _nextPaymentId = 1;

        public List<Payment> GetAllPayments()
        {
            return _payments;
        }

        public Payment GetPaymentById(int id)
        {
            return _payments.FirstOrDefault(p => p.PaymentId == id);
        }

        public Payment CreatePayment(Payment payment)
        {
            payment.PaymentId = _nextPaymentId++;
            payment.PaymentDate = DateTime.Now;

            _payments.Add(payment);
            return payment;
        }

        public bool DeletePayment(int id)
        {
            var payment = _payments.FirstOrDefault(p => p.PaymentId == id);
            if (payment == null)
                return false;

            _payments.Remove(payment);
            return true;
        }
    }
}
