using System;
using System.Linq;
using System.Collections.Generic;
using Transaction_Module__Invent2E_.Models;

namespace Transaction_Module__Invent2E_.Services.Implementations
{
    public class OrderService
    {
        private static List<Order> _orders = new List<Order>();
        private static int _nextOrderId = 1;

        public List<Order> GetAllOrders()
        {
            return _orders;
        }

        public Order GetOrderById(int id)
        {
            return _orders.FirstOrDefault(o => o.OrderId == id);
        }

        public Order CreateOrder(Order order)
        {
            order.OrderId = _nextOrderId++;
            order.OrderDate = DateTime.Now;
            order.OrderStatus = "Pending";
            order.PaymentStatus = "Unpaid";

            _orders.Add(order);
            return order;
        }

        public bool DeleteOrder(int id)
        {
            var order = _orders.FirstOrDefault(o => o.OrderId == id);
            if (order == null)
                return false;

            _orders.Remove(order);
            return true;
        }
    }
}
