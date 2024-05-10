using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Services;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/trail")]
    [ApiController]
    public class TrailController : Controller
    {
        private readonly TrailService _trailService;

        public TrailController(TrailService trailService)
        {
            _trailService = trailService;
        }

        [HttpGet("{trailId:int}")]
        public async Task<ActionResult<TrailToApi>> GetTrail(int trailId)
        {
            var trail = await _trailService.GetTrailByIdAsync(trailId);

            if (trail == null)
                return NotFound();

            return Ok(trail);
        }

        [Authorize]
        [HttpGet("list/user")]
        public async Task<IActionResult> GetTrailListByUser()
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpGet("list/filtered")]
        public async Task<IActionResult> GetFilteredTrailList([FromQuery] int[] countryIds, [FromQuery] decimal minLatitude, [FromQuery] decimal maxLatitude,
            [FromQuery] decimal minLongitude, [FromQuery] decimal maxLongitude)
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpGet("list/user/filtered")]
        public async Task<IActionResult> GetFilteredUserTrailList([FromQuery] int[] countryIds, [FromQuery] decimal minLatitude, [FromQuery] decimal maxLatitude,
            [FromQuery] decimal minLongitude, [FromQuery] decimal maxLongitude)
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        public async Task<IActionResult> CreateTrail([FromForm] TrailFromApi trail)
        {
            var user = TCUserDTO.GetUserFromContext(this.HttpContext);
            if (user == null)
                return StatusCode(401, "Authenticated but not authorized");

            var newTrailId = await _trailService.AddTrailAsync(trail, user);

            if (newTrailId > -1)
                return new CreatedResult($"/tc-api/segment/{newTrailId}", newTrailId);

            return StatusCode(500, "Couldn't add segment");
        }

        [Authorize]
        [HttpPut("{trailId:int}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        public async Task<IActionResult> EditTrail([FromForm] TrailFromApi trail, int trailId)
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpDelete("{trailId:int}")]
        public async Task<IActionResult> DeleteTrail(int trailId)
        {
            throw new NotImplementedException();
        }
    }
}
