using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransactionF.Models
{
    public class Product
    {
        [Key]
        public int ProductID { get; set; }

        [Required]
        [StringLength(100)]
        public string ProductName { get; set; }

        [Required]
        [StringLength(50)]
        public string ProductCode { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public int StockQuantity { get; set; }

        [StringLength(50)]
        public string? Category { get; set; }

        public Product()
        {
            ProductName = string.Empty;
            ProductCode = string.Empty;
            Description = string.Empty;
            Category = string.Empty;
        }
    }
} 