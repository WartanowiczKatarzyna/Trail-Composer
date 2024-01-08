using Microsoft.AspNetCore.Mvc;
using Trail_Composer.Data;
using Trail_Composer.Models.Generated;
using Serilog;
using System.Security.Cryptography.Xml;
using Microsoft.EntityFrameworkCore;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/poi-type")]
    [ApiController]
    public class POITypeController : Controller
    {
        private readonly TrailComposerDbContext _context;

        public POITypeController(TrailComposerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Poitype>> GetPOITypes()
        {
            var poiTypes = await _context.Poitypes.Select(x => new
            {
                id = x.Id,
                name = x.Name,
            }).ToListAsync();

            if (poiTypes == null)
            {
                Log.Information("POI Types list=null");
                return NotFound(); // 404 Not Found
            }

            return Ok(poiTypes);
        }
    }
}
