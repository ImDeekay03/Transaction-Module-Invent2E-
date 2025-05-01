using System;
using System.Collections.Generic;
using System.Linq;
using Transaction_Module__Invent2E_.Models;

namespace Transaction_Module__Invent2E_.Services.Implementations
{
    public class InvoiceService
    {
        private static List<Invoice> _invoices = new List<Invoice>();
        private static int _nextInvoiceId = 1;

        public List<Invoice> GetAllInvoices()
        {
            return _invoices;
        }

        public Invoice GetInvoiceById(int id)
        {
            return _invoices.FirstOrDefault(i => i.InvoiceId == id);
        }

        public Invoice CreateInvoice(Invoice invoice)
        {
            invoice.InvoiceId = _nextInvoiceId++;
            invoice.InvoiceNumber = $"INV-{invoice.InvoiceId:000}";
            invoice.InvoiceDate = DateTime.Now;

            _invoices.Add(invoice);

            return invoice;
        }

        public bool DeleteInvoice(int id)
        {
            var invoice = _invoices.FirstOrDefault(i => i.InvoiceId == id);
            if (invoice == null)
                return false;

            _invoices.Remove(invoice);
            return true;
        }
    }
}
