using Microsoft.AspNetCore.Mvc;
using Trail_Composer.Data;
using Trail_Composer.Models.Generated;
using Serilog;
using Microsoft.EntityFrameworkCore;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/country")]
    [ApiController]
    public class CountryController : Controller
    {
        private readonly TrailComposerDbContext _context;

        public CountryController(TrailComposerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Country>> GetCountries()
        {
            var countires = await _context.Countries.Select(x => new
            {
                id = x.Id,
                countryName = x.CountryName
            }).ToListAsync();

            if (countires == null)
            {
                Log.Information("Country list=null");
                return NotFound();
            }

            return Ok(countires);
        }
    }
}