using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Transaction_Module__Invent2E_.Models;
using Transaction_Module__Invent2E_.Controllers;
using Transaction_Module__Invent2E_.Services.Implementations;

namespace Transaction_Module__Invent2E_.Controllers
{
    public class InvoiceController : Controller
    {
        // Temporary in-memory storage (replace with actual DB/context later)
        private static List<Invoice> _invoices = new List<Invoice>();

        // GET: /Invoice
        public IActionResult Index()
        {
            return View(_invoices);
        }

        //GET: /Invoice/Details/1
        public IActionResult Details(int id)
        {
            var invoice = _invoices.FirstOrDefault(i => i.InvoiceId == id);
            if (invoice == null)
                return NotFound();

            return View(invoice);
        }

        //POST: /Invoice/Create (invoked when payment is recorded)
        [HttpPost]
        public IActionResult Create([FromBody] Invoice invoice)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Simulate auto-generation
            invoice.InvoiceId = _invoices.Count + 1;
            invoice.InvoiceNumber = $"INV-{invoice.InvoiceId:000}";

            _invoices.Add(invoice);

            return Ok(new { message = "Invoice created successfully", invoiceId = invoice.InvoiceId });
        }

        //DELETE: /Invoice/Delete/1 (Optional)
        [HttpPost]
        public IActionResult Delete (int id)
        {
            var invoice = _invoices.FirstOrDefault(i => i.InvoiceId == id);
            if (invoice == null)
                return NotFound();

            _invoices.Remove(invoice);
            return Ok(new { message = "Invoice deleted." });
        }
    }
}
