using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.Services
{
    public class TCUserService : Controller
    {
        private readonly TrailComposerDbContext _context;

        public async Task<string> GetUsernameAsync(string userId)
        {
            var user = await _context.Tcusers.FindAsync(userId);
            
            if (user == null)
            {
                throw new Exception("This user doesn't exists in this database.");
            }

            return user.Name;
        }
        
        public async Task<bool> EditUsernameAsync(string username, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = _context.Tcusers.Find(userId);
                if (user == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                user.Name = username;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
            }
            return false;
        }
    }
}
