using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionF.Data;
using TransactionF.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace TransactionF.Controllers
{
    /// <summary>
    /// Controller for managing orders.
    /// Integration Note: This controller expects data from external modules:
    /// - Customers module for customer information
    /// - Products module for product details
    /// - Payment module for payment processing
    /// - Shipping module for tracking information
    /// </summary>
    public class OrdersController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(AppDbContext context, ILogger<OrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Displays the list of orders with filtering options.
        /// Integration Point: Filters can be extended to use data from other modules.
        /// </summary>
        public IActionResult Index(string searchString, string status, string orderSource, string location, 
            DateTime? orderDateFrom, DateTime? orderDateTo, decimal? minOrderValue, decimal? maxOrderValue)
        {
            // Set ViewBag properties for filter values
            ViewBag.CurrentSearch = searchString;
            ViewBag.CurrentStatus = status;
            ViewBag.CurrentSource = orderSource;
            ViewBag.CurrentLocation = location;
            ViewBag.CurrentDateFrom = orderDateFrom?.ToString("yyyy-MM-dd");
            ViewBag.CurrentDateTo = orderDateTo?.ToString("yyyy-MM-dd");
            ViewBag.CurrentMinValue = minOrderValue;
            ViewBag.CurrentMaxValue = maxOrderValue;

            // Set ViewBag properties for filter options
            ViewBag.Statuses = new[] { "New", "Processing", "Shipped", "Delivered", "Fulfilled", "Cancelled" };
            ViewBag.Locations = new[] { "Manila", "Quezon City", "Makati", "Pasig", "Taguig" };

            // Apply filters
            var filteredOrders = _context.Orders.AsQueryable();

            if (!string.IsNullOrEmpty(searchString))
            {
                filteredOrders = filteredOrders.Where(o => 
                    o.OrderID.ToString().Contains(searchString) ||
                    o.CustomerID.ToString().Contains(searchString) ||
                    o.ShippingAddress.Contains(searchString));
            }

            if (!string.IsNullOrEmpty(status))
            {
                filteredOrders = filteredOrders.Where(o => o.Status == status);
            }

            if (!string.IsNullOrEmpty(orderSource))
            {
                filteredOrders = filteredOrders.Where(o => o.OrderSource == orderSource);
            }

            if (!string.IsNullOrEmpty(location))
            {
                filteredOrders = filteredOrders.Where(o => o.Location == location);
            }

            if (orderDateFrom.HasValue)
            {
                filteredOrders = filteredOrders.Where(o => o.OrderDate >= orderDateFrom.Value);
            }

            if (orderDateTo.HasValue)
            {
                filteredOrders = filteredOrders.Where(o => o.OrderDate <= orderDateTo.Value);
            }

            if (minOrderValue.HasValue)
            {
                filteredOrders = filteredOrders.Where(o => o.OrderTotal >= minOrderValue.Value);
            }

            if (maxOrderValue.HasValue)
            {
                filteredOrders = filteredOrders.Where(o => o.OrderTotal <= maxOrderValue.Value);
            }

            return View(filteredOrders.ToList());
        }

        // GET: Orders/Create
        public IActionResult Create()
        {
            return View();
        }

        // GET: Orders/RecordPayment
        public IActionResult RecordPayment()
        {
            // Initialize a new order with default values
            var order = new Order
            {
                OrderDate = DateTime.Now,
                Status = "New",
                IsPaid = false,
                OrderSource = "Website",
                Location = "Manila",
                ProgressPercentage = 0
            };

            return View(order);
        }

        // POST: Orders/RecordPayment
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RecordPayment(Order order)
        {
            try
            {
                _logger.LogInformation("Starting RecordPayment POST action");
                
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("ModelState is invalid: {errors}", 
                        string.Join(", ", ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage)));
                    return View(order);
                }

                // Get order items from JSON
                var orderItemsJson = Request.Form["OrderItemsJson"].ToString();
                if (!string.IsNullOrEmpty(orderItemsJson))
                {
                    var orderItems = JsonSerializer.Deserialize<List<OrderItem>>(orderItemsJson);
                    if (orderItems != null)
                    {
                        order.OrderItems = orderItems;
                        // Calculate total from items
                        order.OrderTotal = orderItems.Sum(i => i.Quantity * i.UnitPrice);
                    }
                }

                // Combine address fields
                var houseNo = Request.Form["HouseNo"].ToString();
                var street = Request.Form["StreetAddress"].ToString();
                var barangay = Request.Form["Barangay"].ToString();
                var postal = Request.Form["PostalId"].ToString();
                var city = Request.Form["City"].ToString();
                order.ShippingAddress = $"{houseNo} {street}, {barangay}, {city}, {postal}";

                // Set default values if not provided
                if (order.OrderDate == default)
                {
                    order.OrderDate = DateTime.Now;
                }
                if (string.IsNullOrEmpty(order.Status))
                {
                    order.Status = "New";
                }
                if (string.IsNullOrEmpty(order.OrderSource))
                {
                    order.OrderSource = "Website";
                }
                if (string.IsNullOrEmpty(order.Location))
                {
                    order.Location = "Manila";
                }

                // Add order to database
                _context.Orders.Add(order);
                
                // Log the SQL that will be executed
                _logger.LogInformation("Database context state: {state}", _context.ChangeTracker.DebugView.LongView);
                
                var result = await _context.SaveChangesAsync();
                _logger.LogInformation("SaveChangesAsync completed with {result} changes", result);

                if (result > 0)
                {
                    _logger.LogInformation("Order saved successfully with ID: {orderId}", order.OrderID);
                    TempData["SuccessMessage"] = "Order saved successfully!";
                    return RedirectToAction("Index");
                }
                else
                {
                    _logger.LogWarning("No changes were saved to the database");
                    ModelState.AddModelError("", "No changes were saved to the database.");
                    return View(order);
                }
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error while saving order");
                ModelState.AddModelError("", "A database error occurred while saving the order. Please try again.");
                return View(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RecordPayment action");
                ModelState.AddModelError("", "An error occurred while saving the order. Please try again.");
                return View(order);
            }
        }

        // GET: Orders/Invoice/{id}
        public async Task<IActionResult> Invoice(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return NotFound();

            return View(order);
        }
    }
}

