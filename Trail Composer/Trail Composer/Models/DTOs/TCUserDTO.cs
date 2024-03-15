using Serilog;

namespace Trail_Composer.Models.DTOs
{
    public class TCUserDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }

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

        public static string GetUserNameFromContext(HttpContext context)
        {
            var userClaims = context.User.Claims.ToList();

            var nameClaim = userClaims.FirstOrDefault(c => c.Type == "name");

            if (nameClaim == null)
            {
                Log.Error("Access token is incomplete: username (User's object name in AD) is null!");
                return null;
            }

            string username = nameClaim.Value;
            Log.Information($"Immutable ID: {username}");

            return username;
        }

        public static TCUserDTO GetUserFromContext(HttpContext context) {

            return new TCUserDTO { 
                Id = TCUserDTO.GetUserIdFromContext(context),
                Name = TCUserDTO.GetUserNameFromContext(context)
            };
        }
    }
}
