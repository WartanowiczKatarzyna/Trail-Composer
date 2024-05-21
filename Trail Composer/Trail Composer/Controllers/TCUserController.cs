using Microsoft.AspNetCore.Mvc;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;
using Trail_Composer.Models.Services;

namespace Trail_Composer.Controllers
{
    [Produces("application/json")]
    [Route("tc-api/user")]
    [ApiController]
    public class TCUserController : Controller
    {
        private readonly TCUserService _tcuserService;

        public TCUserController(TCUserService tcuserService)
        {
            _tcuserService = tcuserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsername()
        {
            var userId = TCUserDTO.GetUserIdFromContext(this.HttpContext);
            try
            {
                var result = await _tcuserService.GetUsernameAsync(userId);
                return Ok(result);
            } catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        
        [HttpPut]
        public async Task<IActionResult> ChangeUsername()
        {
            var user = TCUserDTO.GetUserFromContext(this.HttpContext);

            var result = await _tcuserService.EditUsernameAsync(user.Id, user.Name);

            if (!result)
                return StatusCode(500, "Error when changing username");
            return Ok(result);
        }
    }
}
