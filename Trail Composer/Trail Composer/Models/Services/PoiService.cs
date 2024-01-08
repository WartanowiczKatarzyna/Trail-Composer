using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Threading.Tasks.Dataflow;
using Trail_Composer.Data;
using Trail_Composer.Models.APIClasses;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.Services
{
    public class PoiService
    {
        private readonly TrailComposerDbContext _context;

        public PoiService(TrailComposerDbContext context)
        {
            _context = context;
        }

        public async Task<PoiAPI> GetPoiByIdAsync (int id)
        {
            var poi = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Select(poi => new PoiAPI
                {
                    Id = poi.Id,
                    UserId = poi.UserId,
                    Name = poi.Name,
                    Latitude = poi.Latitude,
                    Longitude = poi.Longitude,
                    Description = poi.Description,
                    CountryId = poi.CountryId,
                    PoiTypes = poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList()
                })
                .Where(poi => poi.Id == id)
                .SingleOrDefaultAsync();

            return poi;
        }

        public async Task<int> AddPoiAsync (PoiAPI poi) 
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.Tcusers.FindAsync(poi.UserId);

                var country = await _context.Countries.FindAsync(poi.CountryId);

                if (user != null && country != null)
                {
                    // adding Poi
                    var newPoi = new Poi
                    {
                        UserId = poi.UserId,
                        CountryId = poi.CountryId,
                        Name = poi.Name,
                        Latitude = poi.Latitude,
                        Longitude = poi.Longitude,
                        Description = poi.Description,

                        User = user,
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
    
        public async Task DeletePoiAsync (int id) { }
    }
}
