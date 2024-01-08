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
            // Assuming you have an entity named ImageEntity with an Id property
            var photo = await _context.Poiphotos.FindAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            // Retrieve image data from the entity
            byte[] imageData = photo.Photo;

            // Return the image as a FileResult
            return File(imageData, "image/jpeg"); // Adjust the content type based on your image type
        }
    }


}
