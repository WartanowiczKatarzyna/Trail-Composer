using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/path-level")]
    public class PathLevelController : Controller
    {
        private readonly TrailComposerDbContext _context;

        public PathLevelController(TrailComposerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PathLevel>> GetPathTypes()
        {
            var pathLevels = await _context.PathLevels.Select(x => new
            {
                id = x.Id,
                name = x.Name
            }).ToListAsync();

            if (pathLevels == null)
            {
                Log.Information("PathLevels list=null");
                return NotFound();
            }

            return Ok(pathLevels);
        }
    }
}
