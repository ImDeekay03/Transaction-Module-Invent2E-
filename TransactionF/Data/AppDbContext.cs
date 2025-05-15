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
        // Add other DbSets as needed

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.ProductId)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ProductName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.UnitPrice)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.OrderID);
                
                entity.Property(e => e.OrderTotal)
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
            });
        }
    }
}