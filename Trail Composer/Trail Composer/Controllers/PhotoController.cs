using Microsoft.AspNetCore.Mvc;
using Trail_Composer.Data;

namespace Trail_Composer.Controllers
{
    [Route("tc-api/poi-photo")]
    [ApiController]
    public class PhotoController : ControllerBase
    {
        private readonly TrailComposerDbContext _context;

        public PhotoController(TrailComposerDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetImage(int id)
        {
            var photo = await _context.Poiphotos.FindAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            byte[] imageData = photo.Photo;

            return File(imageData, "image/jpeg"); 
        }
    }


}
