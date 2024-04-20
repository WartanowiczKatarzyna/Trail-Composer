﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Evaluation;
using Serilog;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;
using Trail_Composer.Models.Services;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/segment")]
    [ApiController]
    public class SegmentController : Controller
    {
        private readonly SegmentService _segmentService;

        public SegmentController(SegmentService segmentService)
        {
            _segmentService = segmentService;
        }

        [HttpGet("{segmentId:int}")]
        public async Task<ActionResult<PoiFromAPI>> GetSegment(int segmentId)
        {
            var segment = await _segmentService.GetSegmentByIdAsync(segmentId);

            if (segment == null)
                return NotFound();

            return Ok(segment);
        }

        [HttpGet("gpx/{segmentId:int}")]
        public async Task<IActionResult> GetGpxForSegment(int segmentId)
        {
            var gpx = await _segmentService.GetGpx(segmentId);
            if (gpx == null)
                return NotFound();

            return File(gpx, "application/gpx");
        }

        [Authorize]
        [HttpGet("list/user")]
        public async Task<IActionResult> GetSegmentListByUser()
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpGet("list/filtered")]
        public async Task<IActionResult> GetFilteredSegmentList([FromQuery] int[] countryIds, [FromQuery] decimal minLatitude, [FromQuery] decimal maxLatitude,
            [FromQuery] decimal minLongitude, [FromQuery] decimal maxLongitude)
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpGet("list/user/filtered")]
        public async Task<IActionResult> GetFilteredUserSegmentList([FromQuery] int[] countryIds, [FromQuery] decimal minLatitude, [FromQuery] decimal maxLatitude,
            [FromQuery] decimal minLongitude, [FromQuery] decimal maxLongitude)
        {
            throw new NotImplementedException();
        }

        [HttpGet("list/trail/{trailId:int}")]
        public async Task<IActionResult> GetSegmentListByTrail(int trailId)
        {
            throw new NotImplementedException();
        }

        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        // Also adds photos to database
        public async Task<IActionResult> CreateSegment([FromForm] SegmentFromAPI segment)
        {
            Log.Debug("very begining of CreateSegment");
            var user = TCUserDTO.GetUserFromContext(this.HttpContext);
            if (user == null)
                return StatusCode(401, "Authenticated but not authorized");

            var newSegmentId = await _segmentService.AddSegmentAsync(segment, user);

            if (newSegmentId > -1)
                return new CreatedResult($"/tc-api/poi/{newSegmentId}", newSegmentId);

            return StatusCode(500, "Couldn't add POI");
        }

        [Authorize]
        [HttpPut("{segmentId:int}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10485760)] // Limiting to 10 MB (in bytes)
        // Also responsible for handling photos related to the poi
        public async Task<IActionResult> EditSegment([FromForm] SegmentFromAPI segment, int segmentId)
        {
            var userId = TCUserDTO.GetUserIdFromContext(this.HttpContext);
            //var userId = "703645aa-f169-4aa8-9fc9-e3dbb01960d9";

            var result = await _segmentService.EditSegmentAsync(segmentId, segment, userId);

            if (!result)
                return StatusCode(400, "Error when editing poi");
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{segmentId:int}")]
        public async Task<IActionResult> DeleteSegment(int segmentId)
        {
            throw new NotImplementedException();
        }
    }
}
