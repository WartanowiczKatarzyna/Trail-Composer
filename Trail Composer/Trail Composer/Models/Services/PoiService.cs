using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Threading.Tasks.Dataflow;
using Trail_Composer.Controllers.Utils;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;
using Serilog;

namespace Trail_Composer.Models.Services
{
    public class PoiService
    {
        private readonly TrailComposerDbContext _context;

        public PoiService(TrailComposerDbContext context)
        {
            _context = context;
        }

        public async Task<PoiToAPI> GetPoiByIdAsync (int id)
        {
            var poi = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Poiphotos)
                .Select(poi => new PoiToAPI
                {
                    Id = poi.Id,
                    TcuserId = poi.TcuserId,
                    Name = poi.Name,
                    Latitude = poi.Latitude,
                    Longitude = poi.Longitude,
                    Description = poi.Description,
                    CountryId = poi.CountryId,
                    PoiTypes = poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList(),
                    PhotoId = poi.Poiphotos.Select(photo => photo.Id).SingleOrDefault()
                })
                .Where(poi => poi.Id == id)
                .SingleOrDefaultAsync();

            return poi;
        }

        public async Task<int> AddPoiAsync (PoiFromAPI poi, string userId) 
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var country = await _context.Countries.FindAsync(poi.CountryId);

                if ( country != null)
                {
                    // adding Poi
                    var newPoi = new Poi
                    {
                        TcuserId = userId,
                        CountryId = poi.CountryId,
                        Name = poi.Name,
                        Latitude = poi.Latitude,
                        Longitude = poi.Longitude,
                        Description = poi.Description,

                        Country = country
                    };

                    _context.Pois.Add(newPoi);

                    // adding Poi - Poitype relations
                    foreach (var typeId in poi.PoiTypes)
                    {
                        var type = await _context.Poitypes.FindAsync(typeId);

                        if (type != null)
                        {
                            var newPoiPoitype = new PoiPoitype
                            {
                                PoiId = newPoi.Id,
                                PoitypeId = type.Id,

                                Poi = newPoi,
                                Poitype = type
                            };

                            _context.PoiPoitypes.Add(newPoiPoitype);
                        }
                    }

                    // adding Photo
                    if (poi.Photo != null && poi.Photo.Length > 0)
                    {
                        byte[] photoBytes;

                        using (var memoryStream = new MemoryStream())
                        {
                            await poi.Photo.CopyToAsync(memoryStream);
                            photoBytes = memoryStream.ToArray();
                        }
                        var newPoiPhoto = new Poiphoto
                        {
                            PoiId = newPoi.Id,
                            Photo = photoBytes,

                            Poi = newPoi
                        };

                        _context.Poiphotos.Add(newPoiPhoto);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return newPoi.Id;
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return -1;
            }

            return -1;
        }
    
        public async Task<bool> EditPoiAsync (int poiId, PoiFromAPI poi, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var poiDb = await _context.Pois.FirstOrDefaultAsync(p => p.Id == poiId && p.TcuserId == userId);

                if (poiDb == null) { }

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
        public async Task<bool> DeletePoiAsync (int id, string userId) {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var poi = await _context.Pois
                    .Include(p => p.Poiphotos)
                    .FirstOrDefaultAsync(p => p.Id == id && p.TcuserId == userId);

                if (poi == null || poi.Deleted)
                {
                    await transaction.RollbackAsync();
                    Log.Error("DeletePOiAsync error: poi is null");
                    return false;
                }
                else
                {
                    poi.Deleted = true;
                    foreach (var photo in poi.Poiphotos)
                    {
                        photo.Deleted = true;
                    }

                    await _context.SaveChangesAsync();
                    Log.Information("Poi and PoiPhotos sucessfully changes to deleted=true");
                    await transaction.CommitAsync();
                    return true;
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Log.Error($"DeletePOiAsync error: {ex.Message}");
            }
            return false;
        }
    }
}
