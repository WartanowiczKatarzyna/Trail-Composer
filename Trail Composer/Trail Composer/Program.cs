using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.Services;
using Microsoft.Extensions.Options;
using Trail_Composer;

var builder = WebApplication.CreateBuilder(args);
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();

Log.Logger = new LoggerConfiguration().WriteTo.Debug().CreateLogger();

builder.Services.Configure<AzureAdB2COptions>(configuration.GetSection("AzureAdB2C"));
var azureAdB2COptions = configuration.GetSection("AzureAdB2C").Get<AzureAdB2COptions>();

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

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Authority = $"{azureAdB2COptions.Instance}/{azureAdB2COptions.Domain}/{azureAdB2COptions.SignUpSignInPolicyId}/v2.0/";
        options.Audience = $"{azureAdB2COptions.ClientId}";                
    });

builder.Services.AddScoped<PoiService>();
builder.Services.AddScoped<SegmentService>();
builder.Services.AddScoped<TrailService>();
builder.Services.AddScoped<TCUserService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
}

app.UseStaticFiles();
//app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

/*
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");
*/

app.MapFallbackToFile("index.html");

app.Run();
