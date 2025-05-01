using System;

namespace Transaction_Module__Invent2E_.Models
{
    public class Product
    {
        public int ProductId { get; set; } // Unique ID for each product
        public string ProductName { get; set; } // e.g., "Men Cotton Polo Shirt"
        public string SKU {  get; set; } // e.g., "ADDS-GRN-22"
        public string Size { get; set; } // e.g., "L", "XL"

        public int Quantity { get; set; } // e.g., 2 (pcs)
        public decimal Rate { get; set; } // e.g., 120.00
        public decimal Taxrate { get; set; } // e.g., 0.50 for 50%

        public decimal Subtotal => Quantity * Rate * (1 + Taxrate); // Auto-calculated subtotal
        public int OrderId { get; set; } // Foreign key to Order table

        // Metadata (optional, for linking source)
        public string SourceModule {  get; set; } // e.g., "Supplier" or "Customer"

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
