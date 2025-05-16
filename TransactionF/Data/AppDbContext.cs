using Microsoft.EntityFrameworkCore;
using TransactionF.Models;

namespace TransactionF.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<ArchivedOrder> ArchivedOrders { get; set; }
        public DbSet<ArchivedOrderItem> ArchivedOrderItems { get; set; }
        public DbSet<ArchiveHistory> ArchiveHistories { get; set; }
        // Add other DbSets as needed

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.OrderItemID);
                
                entity.Property(e => e.ProductID)
                    .IsRequired();

                entity.Property(e => e.UnitPrice)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(e => e.OrderID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.OrderID);
                
                entity.Property(e => e.OrderTotal)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.PaymentAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.ShippingAddress)
                    .HasMaxLength(200);

                entity.Property(e => e.PaymentMethod)
                    .HasMaxLength(50);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.Property(e => e.OrderSource)
                    .HasMaxLength(50);

                entity.Property(e => e.Location)
                    .HasMaxLength(100);

                entity.Property(e => e.TrackingNumber)
                    .HasMaxLength(50);

                entity.Property(e => e.TrackingProvider)
                    .HasMaxLength(50);

                // Add indexes for frequently queried fields
                entity.HasIndex(e => e.OrderDate);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsArchived);
            });

            modelBuilder.Entity<ArchivedOrder>(entity =>
            {
                entity.HasKey(e => e.ArchivedOrderID);
                
                entity.Property(e => e.OrderTotal)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.PaymentAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.ShippingAddress)
                    .HasMaxLength(200);

                entity.Property(e => e.PaymentMethod)
                    .HasMaxLength(50);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.Property(e => e.OrderSource)
                    .HasMaxLength(50);

                entity.Property(e => e.Location)
                    .HasMaxLength(100);

                entity.Property(e => e.TrackingNumber)
                    .HasMaxLength(50);

                entity.Property(e => e.TrackingProvider)
                    .HasMaxLength(50);

                // Add indexes for archived orders
                entity.HasIndex(e => e.ArchivedDate);
                entity.HasIndex(e => e.OriginalOrderID);
            });

            modelBuilder.Entity<ArchivedOrderItem>(entity =>
            {
                entity.HasKey(e => e.ArchivedOrderItemID);
                
                entity.Property(e => e.UnitPrice)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.TotalPrice)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.ArchivedOrder)
                    .WithMany(o => o.ArchivedOrderItems)
                    .HasForeignKey(e => e.ArchivedOrderID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.ProductID);
                
                entity.Property(e => e.ProductName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Price)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                // Add index for product code
                entity.HasIndex(e => e.ProductCode);
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(e => e.InvoiceID);
                
                entity.Property(e => e.InvoiceNumber)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.PaymentMethod)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ShippingAddress)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Subtotal)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.TotalAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.PaymentAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.ReferenceNumber)
                    .HasMaxLength(50);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Items)
                    .WithOne(e => e.Invoice)
                    .HasForeignKey(e => e.InvoiceID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<InvoiceItem>(entity =>
            {
                entity.HasKey(e => e.InvoiceItemID);
                
                entity.Property(e => e.ProductName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.UnitPrice)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.TotalPrice)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.Invoice)
                    .WithMany(e => e.Items)
                    .HasForeignKey(e => e.InvoiceID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ArchiveHistory>(entity =>
            {
                entity.HasKey(e => e.ArchiveHistoryID);
                
                entity.Property(e => e.ArchivedBy)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.ArchiveReason)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.PreviousStatus)
                    .HasMaxLength(50);

                entity.Property(e => e.PreviousLocation)
                    .HasMaxLength(50);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ArchivedOrder)
                    .WithMany()
                    .HasForeignKey(e => e.ArchivedOrderID)
                    .OnDelete(DeleteBehavior.Restrict);

                // Add index for archive date
                entity.HasIndex(e => e.ArchiveDate);
            });
        }
    }
}