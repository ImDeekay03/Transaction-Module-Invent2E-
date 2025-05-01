using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Transaction_Module__Invent2E_.Models;

namespace Transaction_Module__Invent2E_.Models
{
    public class Customer
    {
        public int CustomerId { get; set; } // Unique identifier (e.g., from supplier and customer module)
        public string CustomerName { get; set; } // e.g., "Mark Steven Villanueva
        public string Email { get; set; } // e.g., "markyvillanueva10@gmail.com"
        public string Phone { get; set; } //e.g., "09154616208"

        public string Address { get; set; } // e.g., "San Mateo, Rizal"

        // Metadata
        public string SourceModule { get; set; } // e.g., "Supplier and Customer Module"
        public DateTime RetrievedAt { get; set; } = DateTime.Now;
    }
}
