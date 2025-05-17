using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionF.Data;
using TransactionF.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System;

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
        public async Task<IActionResult> RecordPayment()
        {
            try
            {
                // Fetch active products ordered by name
                var products = await _context.Products
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.ProductName)
                    .ToListAsync();

                _logger.LogInformation("Found {count} active products", products.Count);
                ViewBag.Products = products;

                var order = new Order
                {
                    OrderDate = DateTime.Now,
                    Status = "New",
                    IsPaid = false,
                    OrderSource = "Website",
                    Location = "Manila",
                    ProgressPercentage = 0,
                    ShippingAddress = "",
                    PaymentMethod = "",
                    ReferenceNumber = "",
                    TrackingNumber = "",
                    TrackingProvider = ""
                };

                return View(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching products in RecordPayment: {message}", ex.Message);
                ViewBag.Products = new List<Product>();
                return View(new Order
                {
                    OrderDate = DateTime.Now,
                    Status = "New",
                    IsPaid = false,
                    OrderSource = "Website",
                    Location = "Manila",
                    ProgressPercentage = 0,
                    ShippingAddress = "",
                    PaymentMethod = "",
                    ReferenceNumber = "",
                    TrackingNumber = "",
                    TrackingProvider = ""
                });
            }
        }

        // POST: Orders/RecordPayment
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RecordPayment(Order order, string OrderItemsJson)
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
                    var products = await _context.Products
                        .Where(p => p.IsActive)
                        .OrderBy(p => p.ProductName)
                        .ToListAsync();
                    ViewBag.Products = products;
                    return View(order);
                }

                // Get order items from JSON
                var orderItems = JsonSerializer.Deserialize<List<OrderItem>>(OrderItemsJson);
                if (orderItems != null)
                {
                    order.OrderItems = orderItems;
                    order.OrderTotal = orderItems.Sum(i => i.Quantity * i.UnitPrice);
                }

                // Combine address fields
                var houseNo = Request.Form["HouseNo"].ToString();
                var street = Request.Form["StreetAddress"].ToString();
                var barangay = Request.Form["Barangay"].ToString();
                var postal = Request.Form["PostalId"].ToString();
                var city = Request.Form["City"].ToString();
                order.ShippingAddress = $"{houseNo} {street}, {barangay}, {city}, {postal}";

                _context.Orders.Add(order);
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
                    var products = await _context.Products
                        .Where(p => p.IsActive)
                        .OrderBy(p => p.ProductName)
                        .ToListAsync();
                    ViewBag.Products = products;
                    return View(order);
                }
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error while saving order");
                ModelState.AddModelError("", "A database error occurred while saving the order. Please try again.");
                var products = await _context.Products
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.ProductName)
                    .ToListAsync();
                ViewBag.Products = products;
                return View(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RecordPayment action");
                ModelState.AddModelError("", "An error occurred while saving the order. Please try again.");
                var products = await _context.Products
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.ProductName)
                    .ToListAsync();
                ViewBag.Products = products;
                return View(order);
            }
        }

        // GET: Orders/Invoice/{id}
        public async Task<IActionResult> Invoice(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.OrderID == id);

            if (invoice == null)
            {
                // If invoice doesn't exist, create it from the order
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderID == id);

                if (order == null)
                    return NotFound();

                invoice = new Invoice
                {
                    OrderID = order.OrderID,
                    PaymentMethod = order.PaymentMethod,
                    ShippingAddress = order.ShippingAddress,
                    Status = "Paid",
                    Subtotal = order.OrderTotal,
                    TotalAmount = order.OrderTotal,
                    PaymentAmount = order.PaymentAmount,
                    PaymentDate = DateTime.Now,
                    ReferenceNumber = order.ReferenceNumber
                };

                // Create invoice items
                foreach (var item in order.OrderItems)
                {
                    invoice.Items.Add(new InvoiceItem
                    {
                        ProductID = item.ProductID,
                        ProductName = item.Product?.ProductName ?? "Unknown Product",
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice
                    });
                }

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();
            }

            return View(invoice);
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoice(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderID == id);

                if (order == null)
                {
                    return Json(new { success = false, message = "Order not found" });
                }

                var invoice = new
                {
                    invoiceNumber = $"INV-{order.OrderID:D6}",
                    invoiceDate = order.OrderDate,
                    paymentMethod = order.PaymentMethod,
                    shippingAddress = order.ShippingAddress,
                    status = order.Status,
                    items = order.OrderItems.Select(oi => new
                    {
                        productName = oi.Product?.ProductName ?? "Unknown Product",
                        quantity = oi.Quantity,
                        unitPrice = oi.UnitPrice,
                        totalPrice = oi.TotalPrice
                    }),
                    subtotal = order.OrderItems.Sum(oi => oi.TotalPrice),
                    totalAmount = order.OrderItems.Sum(oi => oi.TotalPrice),
                    paymentAmount = order.PaymentAmount
                };

                return Json(new { success = true, invoice });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoice for order {OrderId}", id);
                return Json(new { success = false, message = "Error retrieving invoice" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderID == id);

                if (order == null)
                {
                    return Json(new { success = false, message = "Order not found" });
                }

                return Json(new
                {
                    success = true,
                    order = new
                    {
                        orderID = order.OrderID,
                        status = order.Status,
                        trackingProvider = order.TrackingProvider,
                        trackingNumber = order.TrackingNumber,
                        progressPercentage = order.ProgressPercentage
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateOrder(int id, [FromForm] string status, [FromForm] string trackingProvider,
            [FromForm] string trackingNumber, [FromForm] int progressPercentage)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                {
                    return Json(new { success = false, message = "Order not found" });
                }

                order.Status = status;
                order.TrackingProvider = trackingProvider;
                order.TrackingNumber = trackingNumber;
                order.ProgressPercentage = progressPercentage;

                await _context.SaveChangesAsync();
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ArchiveOrder(int id, string reason = "Archived by user")
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderID == id);

                if (order == null)
                {
                    return Json(new { success = false, message = "Order not found" });
                }

                // Create archived order
                var archivedOrder = order.ToArchivedOrder(reason);
                _context.ArchivedOrders.Add(archivedOrder);
                await _context.SaveChangesAsync(); // Save to get the ArchivedOrderID

                // Copy order items to archived items
                foreach (var item in order.OrderItems)
                {
                    var archivedItem = new ArchivedOrderItem
                    {
                        ArchivedOrderID = archivedOrder.ArchivedOrderID,
                        ProductID = item.ProductID,
                        ProductName = item.Product?.ProductName ?? "Unknown Product",
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    };
                    _context.ArchivedOrderItems.Add(archivedItem);
                }

                // Create archive history record
                var archiveHistory = new ArchiveHistory
                {
                    OrderID = order.OrderID,
                    ArchivedOrderID = archivedOrder.ArchivedOrderID,
                    ArchivedBy = User.Identity?.Name ?? "System",
                    ArchiveReason = reason,
                    PreviousStatus = order.Status,
                    PreviousLocation = order.Location
                };
                _context.ArchiveHistories.Add(archiveHistory);

                // Mark original order as archived
                order.IsArchived = true;
                order.ArchivedDate = DateTime.Now;
                order.ArchiveReason = reason;

                await _context.SaveChangesAsync();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving order {OrderId}: {Message}", id, ex.Message);
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ArchiveHistory(
            string searchString,
            string archivedBy,
            DateTime? archiveDateFrom,
            DateTime? archiveDateTo,
            string previousStatus,
            string previousLocation)
        {
            try
            {
                // Set ViewBag properties for filter values
                ViewBag.CurrentSearch = searchString;
                ViewBag.CurrentArchivedBy = archivedBy;
                ViewBag.CurrentDateFrom = archiveDateFrom?.ToString("yyyy-MM-dd");
                ViewBag.CurrentDateTo = archiveDateTo?.ToString("yyyy-MM-dd");
                ViewBag.CurrentStatus = previousStatus;
                ViewBag.CurrentLocation = previousLocation;

                // Get unique values for filter dropdowns
                ViewBag.ArchivedByList = await _context.ArchiveHistories
                    .Select(h => h.ArchivedBy)
                    .Distinct()
                    .OrderBy(h => h)
                    .ToListAsync();

                ViewBag.Statuses = new[] { "New", "Processing", "Shipped", "Delivered", "Fulfilled", "Cancelled" };
                ViewBag.Locations = new[] { "Manila", "Quezon City", "Makati", "Pasig", "Taguig" };

                // Build query with filters
                var query = _context.ArchiveHistories
                    .Include(h => h.Order)
                    .Include(h => h.ArchivedOrder)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchString))
                {
                    query = query.Where(h =>
                        h.OrderID.ToString().Contains(searchString) ||
                        h.ArchivedOrderID.ToString().Contains(searchString) ||
                        h.ArchiveReason.Contains(searchString));
                }

                if (!string.IsNullOrEmpty(archivedBy))
                {
                    query = query.Where(h => h.ArchivedBy == archivedBy);
                }

                if (archiveDateFrom.HasValue)
                {
                    query = query.Where(h => h.ArchiveDate >= archiveDateFrom.Value);
                }

                if (archiveDateTo.HasValue)
                {
                    query = query.Where(h => h.ArchiveDate <= archiveDateTo.Value);
                }

                if (!string.IsNullOrEmpty(previousStatus))
                {
                    query = query.Where(h => h.PreviousStatus == previousStatus);
                }

                if (!string.IsNullOrEmpty(previousLocation))
                {
                    query = query.Where(h => h.PreviousLocation == previousLocation);
                }

                // Order by most recent first
                var archiveHistory = await query
                    .OrderByDescending(h => h.ArchiveDate)
                    .ToListAsync();

                return View(archiveHistory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving archive history: {Message}", ex.Message);
                TempData["ErrorMessage"] = "Error retrieving archive history. Please try again.";
                return View(new List<ArchiveHistory>());
            }
        }
    }
}