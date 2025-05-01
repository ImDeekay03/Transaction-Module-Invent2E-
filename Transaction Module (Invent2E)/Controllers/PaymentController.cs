using Microsoft.AspNetCore.Mvc;
using Transaction_Module__Invent2E_.Models;

namespace Transaction_Module__Invent2E_.Controllers
{
    public class PaymentController : Controller
    {
        // Temporary in-memory storage (replace with DB/context in the future)
        private static List<Payment> _payments = new List<Payment>();

        // GET: /Payment
        public IActionResult Index()
        {
            return View(_payments);
        }

        //GET: /Payment/Details/5
        public IActionResult Details(int id)
        {
            var payment = _payments.FirstOrDefault(p => p.PaymentId == id);
            if (payment == null)
                return NotFound();

            return View(payment);
        }

        // POST: /Payment/Create
        [HttpPost]
        public IActionResult Create([FromBody] Payment payment)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);

            payment.PaymentId = _payments.Count + 1;
            payment.PaymentDate = DateTime.Now;

            _payments.Add(payment);

            // Optionally: Trigger invoice generation logic here

            return Ok(new { message = "Payment recorded successfully", paymentId = payment.PaymentId });
        }

        // DELETE: /Payment/Delete/5 (Optional)
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var payment = _payments.FirstOrDefault(p => p.PaymentId == id);
            if (payment == null)
                return NotFound();

            _payments.Remove(payment);
            return Ok(new { message = "Payment deleted." });
        }
    }
}
