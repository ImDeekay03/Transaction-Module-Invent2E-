using Microsoft.EntityFrameworkCore;
using TransactionF.Data; // Assuming your AppDbContext is in this namespace

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add database context with error handling
try
{
	builder.Services.AddDbContext<AppDbContext>(options =>
	{
		options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
	});
}
catch (Exception ex)
{
	Console.WriteLine($"Database configuration error: {ex.Message}");
	throw;
}

var app = builder.Build();

// Create database if it doesn't exist
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	try
	{
		var context = services.GetRequiredService<AppDbContext>();
		context.Database.EnsureCreated();
		Console.WriteLine("Database created successfully");
	}
	catch (Exception ex)
	{
		var logger = services.GetRequiredService<ILogger<Program>>();
		logger.LogError(ex, "An error occurred while creating the database.");
		Console.WriteLine($"Database creation error: {ex.Message}");
	}
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Home/Error"); // Consider changing this to /Orders/Error if needed.
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");

// Start the application *after* configuration.
app.Run();