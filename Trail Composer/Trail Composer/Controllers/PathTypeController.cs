using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/path-type")]
    public class PathTypeController : Controller
    {
        private readonly TrailComposerDbContext _context;

        public PathTypeController(TrailComposerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PathType>> GetPathTypes()
        {
            var pathTypes = await _context.PathTypes.Select(x => new
            {
                id = x.Id,
                name = x.Name
            }).ToListAsync();

            if (pathTypes == null)
            {
                Log.Information("PathTypes list=null");
                return NotFound();
            }

            return Ok(pathTypes);
        }
    }
}
