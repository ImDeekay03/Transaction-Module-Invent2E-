using System.Linq;
using Transaction_Module__Invent2E_.Models;

namespace Transaction_Module__Invent2E_.Services.Implementations
{
    public class OrderService
    {
        private static List<Order> _orders = new List<Order>
        {
            new Order
            {
                OrderId = 1,
                CustomerName = "Juan Dela Cruz",
                OrderDate = DateTime.Today,
                PaymentStatus = "Unpaid",
                TotalAmount = 1500.00M,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem { ProductName = "Mango", Quantity = 5, Rate = 100, Tax = 10 },
                    new OrderItem { ProductName = "Rice", Quantity = 2, Rate = 500, Tax = 50 }
                }
            }
        };

        public List<Order> GetAllOrders() => _orders;
        public Order GetOrderById(int id)
        {
            return _orders.FirstOrDefault(o => o.OrderId == id);
        }
    }
}
