using Serilog;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Controllers.Utils
{
    public class UserId
    {
        public static string GetUserIdFromContext(HttpContext context)
        {
            var userClaims = context.User.Claims.ToList();

            var immutableIdClaim = userClaims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/identity/claims/objectidentifier");

            if (immutableIdClaim == null)
            {
                Log.Error("Access token is incomplete: immutableIdClaim (User's object id in AD) is null!");
                return null;
            }

            string userId = immutableIdClaim.Value;
            Log.Information($"Immutable ID: {userId}");

            return userId;
        }
    }
}
