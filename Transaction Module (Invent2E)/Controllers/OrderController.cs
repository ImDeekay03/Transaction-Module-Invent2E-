using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Transaction_Module__Invent2E_.Controllers;
using Transaction_Module__Invent2E_.Services.Interfaces;

namespace Transaction_Module__Invent2E_.Controllers
{
    public class OrderController :Controller
    {
        private readonly IOrderService OrderService;
        private readonly IInvoiceService InvoiceService;   // To fetch invoice details
        private readonly IPaymentService PaymentService;   // To record payments
        // Potentially other service dependencies

        public OrderController(IOrderService orderService, IInvoiceService invoiceService, IPaymentService paymentService)
        {
            OrderService = orderService;
            InvoiceService = invoiceService;
            PaymentService = paymentService;
        }

        // GET: Orders
        public async Task<IActionResult> Index()
        {
            var orders = await OrderService.GetAllOrdersAsync();
            return View(orders);
        }
    }
}
