using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.Services;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration().WriteTo.Debug().CreateLogger();

// Add services to the container.

builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<TrailComposerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Trail_Composer_DB")));
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueCountLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
    options.MultipartBodyLengthLimit = 10485760; // Limiting to 10 MB (in bytes)
});

builder.Services.AddScoped<PoiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
}

app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
