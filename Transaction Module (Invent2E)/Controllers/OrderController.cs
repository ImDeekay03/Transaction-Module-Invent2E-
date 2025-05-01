using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Transaction_Module__Invent2E_.Controllers;
using Transaction_Module__Invent2E_.Services.Implementations;
using Transaction_Module__Invent2E_.Services.Interfaces;

namespace Transaction_Module__Invent2E_.Controllers
{
    public class OrderController : Controller
    {
        private readonly OrderService _service;
        public OrdersController(OrderService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            var orders = _service.GetAllOrders();
            return View(orders);
        }

        public IActionResult GetOrderDetails(int id)
        {
            var order = _service.GetOrderById(id);
            return PartialView("_OrderDetailsModal", order);
        }
    }
}
