using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Threading.Tasks.Dataflow;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;
using Serilog;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Humanizer.Bytes;
using Trail_Composer.Models.DTOs.Comparers;
using Microsoft.AspNetCore.Mvc;

namespace Trail_Composer.Models.Services
{
    public class PoiService
    {
        private readonly TrailComposerDbContext _context;

        public PoiService(TrailComposerDbContext context)
        {
            _context = context;
        }
        public async Task<PoiToApiDetails> GetPoiByIdAsync (int id)
        {
            var poi = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Poiphotos)
                .Select(poi => new PoiToApiDetails
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
        public async Task<IEnumerable<PoiListElementToApi>> GetUserPoiListAsync (string userId)
        {
            var poiList = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Tcuser)
                .Where(poi => poi.TcuserId == userId)
                .Select(poi => new PoiListElementToApi
                {
                    Id = poi.Id,
                    Username = poi.Tcuser.Name,
                    Name = poi.Name,
                    Latitude = poi.Latitude,
                    Longitude = poi.Longitude,
                    CountryId = poi.CountryId,
                    PoiTypeIds = poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList()
                })
                .ToListAsync();

            return poiList;
        }
        public async Task<IEnumerable<PoiListElementToApi>> GetFilteredPoiListAsync (string userId, int[] countryIds, decimal minLatitude, decimal maxLatitude,
            decimal minLongitude, decimal maxLongitude)
        {
            var poiList = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Tcuser)
                .Where(poi => (
                                poi.TcuserId != userId &&
                                (countryIds.Contains(poi.CountryId) || (countryIds.Length == 0)) &&
                                (poi.Latitude >= minLatitude) &&
                                (poi.Latitude <= maxLatitude) &&
                                (poi.Longitude >= minLongitude) &&
                                (poi.Longitude <= maxLongitude)
                            ))
                .Select(poi => new PoiListElementToApi
                {
                    Id = poi.Id,
                    Username = poi.Tcuser.Name,
                    Name = poi.Name,
                    Latitude = poi.Latitude,
                    Longitude = poi.Longitude,
                    CountryId = poi.CountryId,
                    PoiTypeIds = poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList()
                })
                .OrderBy(poi => poi.Id)
                .Take(1000)
                .ToListAsync();

            return poiList;
        }
        public async Task<IEnumerable<PoiListElementToApi>> GetFilteredUserPoiListAsync (string userId, int[] countryIds, decimal minLatitude, decimal maxLatitude,
            decimal minLongitude, decimal maxLongitude)
        {
            var poiList = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Tcuser)
                .Where(poi => (
                                poi.TcuserId == userId &&
                                (countryIds.Contains(poi.CountryId) || (countryIds.Length == 0)) &&
                                (poi.Latitude >= minLatitude) &&
                                (poi.Latitude <= maxLatitude) &&
                                (poi.Longitude >= minLongitude) &&
                                (poi.Longitude <= maxLongitude)
                            ))
                .Select(poi => new PoiListElementToApi
                {
                    Id = poi.Id,
                    Username = poi.Tcuser.Name,
                    Name = poi.Name,
                    Latitude = poi.Latitude,
                    Longitude = poi.Longitude,
                    CountryId = poi.CountryId,
                    PoiTypeIds = poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList()
                })
                .OrderBy(poi => poi.Id)
                .Take(1000)
                .ToListAsync();

            return poiList;
        }
        public async Task<IEnumerable<PoiListElementToApi>> GetPoiListBySegmentAsync (int segmentId) 
        {
            var poiList = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Tcuser)
                .Join(
                    _context.SegmentPois,
                    poi => poi.Id,
                    sp => sp.PoiId,
                    (poi, sp) => new { poi, sp }
                )
                .Where(mergedElem => mergedElem.sp.SegmentId == segmentId)
                .OrderBy(mergedElem => mergedElem.sp.PoiOrder)
                .Select(mergedElem => new PoiListElementToApi
                {
                    Id = mergedElem.poi.Id,
                    Username = mergedElem.poi.Tcuser.Name,
                    Name = mergedElem.poi.Name,
                    Latitude = mergedElem.poi.Latitude,
                    Longitude = mergedElem.poi.Longitude,
                    CountryId = mergedElem.poi.CountryId,
                    PoiTypeIds = mergedElem.poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList()
                })
                .ToListAsync();

            return poiList;
        }
        public async Task<IEnumerable<PoiListElementToApi>> GetPoiListByTrailAsync (int trailId)
        {
            var poiList = await _context.Pois
                .Include(poi => poi.PoiPoitypes)
                .Include(poi => poi.Tcuser)
                .Join(
                    _context.SegmentPois,
                    poi => poi.Id,
                    sp => sp.PoiId,
                    (poi, sp) => new { poi, sp }
                )
                .Join(
                    _context.TrailSegments,
                    mergedElem => mergedElem.sp.SegmentId,
                    ts => ts.SegmentId,
                    (mergedElem, ts) => new { mergedElem.poi, mergedElem.sp, ts}
                )
                .Where(mergedElem => mergedElem.ts.TrailId == trailId)
                .OrderBy(mergedElem => mergedElem.ts.SegmentOrder)
                .ThenBy(mergedElem => mergedElem.sp.PoiOrder)
                .Select(mergedElem => new PoiListElementToApi
                {
                    Id = mergedElem.poi.Id,
                    Username = mergedElem.poi.Tcuser.Name,
                    Name = mergedElem.poi.Name,
                    Latitude = mergedElem.poi.Latitude,
                    Longitude = mergedElem.poi.Longitude,
                    CountryId = mergedElem.poi.CountryId,
                    PoiTypeIds = mergedElem.poi.PoiPoitypes.Select(poiPoiType => poiPoiType.Poitype).Select(poiType => poiType.Id).ToList()
                })
                .ToListAsync();

            poiList = poiList.Distinct(new PoiListElementToApiComparer()).ToList();

            return poiList;
        }
        public async Task<int> AddPoiAsync (PoiFromAPI poi, TCUserDTO user) 
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var country = await _context.Countries.FindAsync(poi.CountryId);
                var tcuser = await _context.Tcusers.FindAsync(user.Id);

                if (tcuser == null)
                {
                    tcuser = new Tcuser
                    {
                        Id = user.Id,
                        Name = user.Name
                    };
                    _context.Tcusers.Add(tcuser);
                }

                if ( country != null)
                {
                    // adding Poi
                    var newPoi = new Poi
                    {
                        TcuserId = user.Id,
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
        public async Task<bool> EditPoiAsync(int poiId, PoiFromAPI poiApi, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var poiDb = await _context.Pois
                    .Include(p => p.PoiPoitypes)
                    .Include(p => p.Poiphotos)
                    .FirstOrDefaultAsync(p => p.Id == poiId && p.TcuserId == userId);
                var poiApiCountry = await _context.Countries.FindAsync(poiApi.CountryId);

                if (poiDb == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("DeletePOiAsync error: couldn't find poi;");
                    return false;
                }
                else if (poiApiCountry == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("DeletePOiAsync error: couldn't find country;");
                    return false;
                }

                poiDb.Name = poiApi.Name;
                poiDb.Latitude = poiApi.Latitude;
                poiDb.Longitude = poiApi.Longitude;
                poiDb.Description = poiApi.Description;

                poiDb.CountryId = poiApi.CountryId;
                poiDb.Country = poiApiCountry;

                //_context.AttachRange(poiDb.PoiPoitypes); -> seem to do nothing
                _context.PoiPoitypes.RemoveRange(poiDb.PoiPoitypes);
                foreach (var poiTypeApiId in poiApi.PoiTypes)
                {
                    var poiTypeApi = _context.Poitypes.Find(poiTypeApiId);
                    if (poiTypeApi == null)
                    {
                        await transaction.RollbackAsync();
                        Log.Error($"DeletePOiAsync error: poiType with id {poiTypeApi} doesn't exist;");
                        return false;
                    }

                    var poiPoiTypeApi = new PoiPoitype
                    {
                        PoiId = poiId,
                        PoitypeId = poiTypeApiId,

                        Poi = poiDb,
                        Poitype = poiTypeApi
                    };
                    _context.PoiPoitypes.Add(poiPoiTypeApi);
                }

                if (poiApi.Photo == null || poiApi.Photo.Length <= 0)
                {
                    if (poiApi.deletePhoto != null)
                    {
                        var poiPhotoToDelete = poiDb.Poiphotos.FirstOrDefault(pp => pp.Id == poiApi.deletePhoto);
                        if (poiPhotoToDelete == null)
                        {
                            await transaction.RollbackAsync();
                            Log.Error($"DeletePOiAsync error: couldn't find photo to delete;");
                            return false;
                        }
                        _context.Poiphotos.Remove(poiPhotoToDelete);
                    }                    
                } else
                {
                    var poiPhotoDb = poiDb.Poiphotos.SingleOrDefault();
                    byte[] photoApiBytes;
                    using (var memoryStream = new MemoryStream())
                    {
                        await poiApi.Photo.CopyToAsync(memoryStream);
                        photoApiBytes = memoryStream.ToArray();
                    }
                    //tworzenie nowego zdjęcia
                    if (poiPhotoDb == null)
                    {
                        var newPoiPhoto = new Poiphoto
                        {
                            PoiId = poiId,
                            Photo = photoApiBytes,

                            Poi = poiDb
                        };

                        _context.Poiphotos.Add(newPoiPhoto);
                    } else
                    {
                        //nadpisywanie bloba
                        poiPhotoDb.Photo = photoApiBytes;

                    }
                }

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
                    .Include(p => p.PoiPoitypes)
                    .Include(p => p.SegmentPois)
                    .FirstOrDefaultAsync(p => p.Id == id && p.TcuserId == userId);

                if (poi == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("DeletePOiAsync error: poi is null");
                    return false;
                }

                _context.Poiphotos.RemoveRange(poi.Poiphotos);
                _context.PoiPoitypes.RemoveRange(poi.PoiPoitypes);
                _context.SegmentPois.RemoveRange(poi.SegmentPois);
                _context.Pois.Remove(poi);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                Log.Information("Poi and PoiPhotos sucessfully changes to deleted=true");
                return true;
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
