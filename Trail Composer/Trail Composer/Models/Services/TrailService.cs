using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Triangulate;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.Services
{
    public class TrailService
    {
        private readonly TrailComposerDbContext _context;

        public async Task<TrailToApi> GetTrailByIdAsync(int id)
        {
            var trail = await _context.Trails
                .Include(trail => trail.TrailSegments)
                .Select(trail => new TrailToApi
                {
                    Id = trail.Id,
                    TcuserId = trail.TcuserId,
                    Name = trail.Name,
                    Username = trail.Tcuser.Name,
                    Description = trail.Description,
                    LevelId = trail.LevelId,
                    CountryIds = trail.TrailCountries.Select(country => country.Id).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList(),
                    SegmentIds = trail.TrailSegments.Select(trailSeg => trailSeg.Id).ToList(),
                })
                .Where(trail => trail.Id == id)
                .SingleOrDefaultAsync();

            return trail;
        }
        public async Task<IEnumerable<TrailToApi>> GetUserTrailListAsync(string userId)
        {
            var trailList = await _context.Trails
                .Include(trail => trail.TrailSegments)
                .Where(trail => trail.TcuserId == userId)
                .Select(trail => new TrailToApi
                {
                    Id = trail.Id,
                    TcuserId = trail.TcuserId,
                    Name = trail.Name,
                    Username = trail.Tcuser.Name,
                    LevelId = trail.LevelId,
                    CountryIds = trail.TrailCountries.Select(country => country.Id).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList(),
                    SegmentIds = trail.TrailSegments.Select(trailSeg => trailSeg.Id).ToList(),
                })
                .ToListAsync();

            return trailList;
        }
        public async Task<IEnumerable<TrailToApi>> GetFilteredTrailListAsync(string userId, int[] countryIds, decimal minLatitude, decimal maxLatitude,
           decimal minLongitude, decimal maxLongitude)
        {
            var trailList = await _context.Trails
                .Include(trail => trail.TrailTypes)
                .Include(trail => trail.TrailCountries)
                .Where(trail => (
                                trail.TcuserId != userId &&
                                (trail.TrailCountries.Any(countryId => countryIds.Contains(countryId.CountryId)) ||
                                //(trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList().Intersect(countryIds).Any() || 
                                (countryIds.Length == 0)) &&
                                (trail.MinLatitude > minLatitude) &&
                                (trail.MaxLatitude < maxLatitude) &&
                                (trail.MinLongitude > minLongitude) &&
                                (trail.MaxLongitude < maxLongitude)
                            ))
                .Select(trail => new TrailToApi
                {
                    Id = trail.Id,
                    TcuserId = trail.TcuserId,
                    Name = trail.Name,
                    Username = trail.Tcuser.Name,
                    LevelId = trail.LevelId,
                    CountryIds = trail.TrailCountries.Select(country => country.Id).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList()
                })
                .OrderBy(trail => trail.Id)
                .Take(1000)
                .ToListAsync();

            return trailList;
        }
        public async Task<IEnumerable<TrailToApi>> GetFilteredUserTrailListAsync(string userId, int[] countryIds, decimal minLatitude, decimal maxLatitude,
            decimal minLongitude, decimal maxLongitude)
        {
            var trailList = await _context.Trails
                .Include(trail => trail.TrailTypes)
                .Where(trail => (
                                trail.TcuserId == userId &&
                                (trail.TrailCountries.Any(countryId => countryIds.Contains(countryId.CountryId)) ||
                                //(trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList().Intersect(countryIds).Any() || 
                                (countryIds.Length == 0)) &&
                                (trail.MinLatitude > minLatitude) &&
                                (trail.MaxLatitude < maxLatitude) &&
                                (trail.MinLongitude > minLongitude) &&
                                (trail.MaxLongitude < maxLongitude)
                            ))
                .Select(trail => new TrailToApi
                {
                    Id = trail.Id,
                    TcuserId = trail.TcuserId,
                    Name = trail.Name,
                    Username = trail.Tcuser.Name,
                    LevelId = trail.LevelId,
                    CountryIds = trail.TrailCountries.Select(country => country.Id).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList()
                })
                .OrderBy(trail => trail.Id)
                .Take(1000)
                .ToListAsync();

            return trailList;
        }
        public async Task<int> AddTrailAsync(TrailFromApi trail, TCUserDTO user)
        {
            if (trail.CountryIds.Count < 1 || trail.PathTypeIds.Count < 1)
                return -2;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var level = await _context.PathLevels.FindAsync(trail.LevelId);
                var tcuser = await _context.Tcusers.FindAsync(user.Id);

                if (level == null)
                {
                    await transaction.RollbackAsync();
                    return -1;
                }

                if (tcuser == null)
                {
                    tcuser = new Tcuser
                    {
                        Id = user.Id,
                        Name = user.Name
                    };
                    _context.Tcusers.Add(tcuser);
                }

                // adding Trail
                var newTrail = new Trail
                {
                    TcuserId = user.Id,
                    Name = trail.Name,
                    Description = trail.Description,
                    MinLongitude = trail.MinLongitude,
                    MaxLongitude = trail.MaxLongitude,
                    MinLatitude = trail.MinLatitude,
                    MaxLatitude = trail.MaxLatitude,
                    Level = level,
                };

                _context.Trails.Add(newTrail);

                // adding Trail - Pathtype relations
                foreach (var typeId in trail.PathTypeIds)
                {
                    var type = await _context.PathTypes.FindAsync(typeId);

                    if (type != null)
                    {
                        var trailType = new TrailType
                        {
                            TrailId = newTrail.Id,
                            PathTypeId = type.Id,
                            Trail = newTrail,
                            PathType = type
                        };

                        _context.TrailTypes.Add(trailType);
                    }
                }

                // adding Trail - Country relations
                foreach (var countryId in trail.CountryIds)
                {
                    var country = await _context.Countries.FindAsync(countryId);

                    if (country != null)
                    {
                        var trailCountry = new TrailCountry
                        {
                            TrailId = newTrail.Id,
                            CountryId = country.Id,
                            Trail = newTrail,
                            Country = country
                        };

                        _context.TrailCountries.Add(trailCountry);
                    }
                }

                // adding Trail - Segment relations
                if (trail.SegmentIds != null)
                {
                    for (int i = 0; i < trail.SegmentIds.Count; i++)
                    {
                        var segment = await _context.Segments.FindAsync(trail.SegmentIds.ElementAt(i));

                        if (segment == null)
                            continue;

                        var trailSegment = new TrailSegment
                        {
                            TrailId = newTrail.Id,
                            SegmentId = segment.Id,
                            SegmentOrder = i,

                            Trail = newTrail,
                            Segment = segment
                        };

                        _context.TrailSegments.Add(trailSegment);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return newTrail.Id;

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return -1;
            }
        }
        public async Task<bool> EditTrailAsync(int trailId, TrailFromApi trailApi, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var trailDb = await _context.Trails
                    .Include(t => t.TrailTypes)
                    .Include(t => t.TrailSegments)
                    .Include(t => t.TrailCountries)
                    .FirstOrDefaultAsync(t => t.Id == trailId && t.TcuserId == userId);
                var trailApiLevel = await _context.PathLevels.FindAsync(trailApi.LevelId);

                if (trailDb == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("EditTrailAsync error: couldn't find trail;");
                    return false;
                }
                else if (trailApiLevel == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("EditTrailAsync error: couldn't find level;");
                    return false;
                }

                trailDb.Name = trailApi.Name;
                trailDb.Description = trailApi.Description;
                trailDb.MinLongitude = trailApi.MinLongitude;
                trailDb.MaxLongitude = trailApi.MaxLongitude;
                trailDb.MinLatitude = trailApi.MinLatitude;
                trailDb.MaxLatitude = trailApi.MaxLatitude;

                trailDb.LevelId = trailApi.LevelId;
                trailDb.Level = trailApiLevel;

                _context.TrailTypes.RemoveRange(trailDb.TrailTypes);
                foreach (var trailTypeApiId in trailApi.PathTypeIds)
                {
                    var trailTypeApi = _context.PathTypes.Find(trailTypeApiId);
                    if (trailTypeApi == null)
                    {
                        await transaction.RollbackAsync();
                        Log.Error($"EditTrailAsync error: trailType with id {trailTypeApi} doesn't exist;");
                        return false;
                    }

                    var trailPathTypeApi = new TrailType
                    {
                        TrailId = trailId,
                        PathTypeId = trailTypeApiId,

                        Trail = trailDb,
                        PathType = trailTypeApi
                    };
                    _context.TrailTypes.Add(trailPathTypeApi);
                }

                _context.TrailCountries.RemoveRange(trailDb.TrailCountries);
                foreach (var trailCountryApiId in trailApi.CountryIds)
                {
                    var trailCountryApi = _context.Countries.Find(trailCountryApiId);
                    if (trailCountryApi == null)
                    {
                        await transaction.RollbackAsync();
                        Log.Error($"EditTrailAsync error: trail's country with id {trailCountryApi} doesn't exist;");
                        return false;
                    }

                    var newTrailCountryApi = new TrailCountry
                    {
                        TrailId = trailId,
                        CountryId = trailCountryApiId,

                        Trail = trailDb,
                        Country = trailCountryApi
                    };
                    _context.TrailCountries.Add(newTrailCountryApi);
                }

                _context.TrailSegments.RemoveRange(trailDb.TrailSegments);
                if (trailApi.SegmentIds != null)
                {
                    for (int i = 0; i < trailApi.SegmentIds.Count; i++)
                    {
                        var seg = await _context.Segments.FindAsync(trailApi.SegmentIds.ElementAt(i));

                        if (seg == null)
                            continue;

                        var trailSegment = new TrailSegment
                        {
                            TrailId = trailId,
                            SegmentId = seg.Id,
                            SegmentOrder = i,

                            Trail = trailDb,
                            Segment = seg
                        };

                        _context.TrailSegments.Add(trailSegment);
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
        public async Task<bool> DeleteTrailAsync(int id, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var trail = await _context.Trails
                    .Include(trails => trails.TrailTypes)
                    .Include(trails => trails.TrailCountries)
                    .Include(trails => trails.TrailSegments)
                    .FirstOrDefaultAsync(trail => trail.Id == id && trail.TcuserId == userId);

                if (trail == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("DeleteTrailAsync error: trail is null");
                    return false;
                }

                _context.TrailTypes.RemoveRange(trail.TrailTypes);
                _context.TrailCountries.RemoveRange(trail.TrailCountries);
                _context.TrailSegments.RemoveRange(trail.TrailSegments);
                _context.Trails.Remove(trail);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Log.Error($"DeleteTrailAsync error: {ex.Message}");
            }
            return false;
        }
    }
}
