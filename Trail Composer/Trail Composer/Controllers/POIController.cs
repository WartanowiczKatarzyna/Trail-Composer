using Microsoft.AspNetCore.Mvc;
using Trail_Composer.Models.Generated;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Trail_Composer.Models.Services;
using Trail_Composer.Models.APIClasses;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/poi")]
    [ApiController]
    public class POIController : Controller
    {
        private readonly PoiService _poiService;

        public POIController(PoiService poiService)
        {
            _poiService = poiService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PoiFromAPI>> GetPOI(int id)
        {
            var poi = await _poiService.GetPoiByIdAsync(id);
            
            if (poi == null)
                return NotFound(); // 404 Not Found

            return Ok(poi);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        public async Task<ActionResult> CreatePOI([FromForm]PoiFromAPI poi)
        {
            var newPoiId = await _poiService.AddPoiAsync(poi);

            if (newPoiId > -1)
                return new CreatedResult($"/tc-api/poi/{newPoiId}", newPoiId);

            return StatusCode(500, "Couldn't add POI");
        }
    }
}