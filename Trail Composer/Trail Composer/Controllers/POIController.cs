using Microsoft.AspNetCore.Mvc;
using Trail_Composer.Models.Generated;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Trail_Composer.Models.Services;
using Trail_Composer.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

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

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PoiFromAPI>> GetPOI(int id)
        {
            var poi = await _poiService.GetPoiByIdAsync(id);
            
            if (poi == null)
                return NotFound(); // 404 Not Found

            return Ok(poi);
        }

        [Authorize]
        [HttpGet("list/user")]
        public async Task<ActionResult> GetPOIListByUser()
        {
            var userId = TCUserDTO.GetUserIdFromContext(this.HttpContext);
            //var userId = "703645aa-f169-4aa8-9fc9-e3dbb01960d9";
            var result = await _poiService.GetUserPoiListAsync(userId);
            return Ok(result);
        }

        [HttpGet("list/segments")]
        public async Task<ActionResult> GetPOIListBySegments([FromQuery] int[] segmentIds)
        {
            return Ok();
        }

        [HttpGet("list/filtered")]
        public async Task<ActionResult> GetFilteredPOIList(int countryId, bool owned, [FromQuery] double[] latitudes, [FromQuery] double[] longitudes)
        {
            return Ok();
        }             

        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        // Also adds photos to database
        public async Task<ActionResult> CreatePOI([FromForm]PoiFromAPI poi)
        {
            var user = TCUserDTO.GetUserFromContext(this.HttpContext);
            if (user == null)
                return StatusCode(401, "Authenticated but not authorized");

            var newPoiId = await _poiService.AddPoiAsync(poi, user);

            if (newPoiId > -1)
                return new CreatedResult($"/tc-api/poi/{newPoiId}", newPoiId);

            return StatusCode(500, "Couldn't add POI");
        }

        [Authorize]
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        // Also responsible for handling photos related to the poi
        public async Task<ActionResult> DeletePOI([FromForm]PoiFromAPI poi, int id)
        {
            //var userId = UserId.GetUserIdFromContext(this.HttpContext);
            var userId = "703645aa-f169-4aa8-9fc9-e3dbb01960d9";

            var result = await _poiService.EditPoiAsync(id, poi, userId);

            if (!result)
                return StatusCode(400, "Error when editing poi");
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePOI(int id)
        {
            var userId = TCUserDTO.GetUserIdFromContext(this.HttpContext);
            bool deletedSuccess = await _poiService.DeletePoiAsync(id, userId);

            if (deletedSuccess)
                return Ok();

            return NotFound();
        }
    }
}