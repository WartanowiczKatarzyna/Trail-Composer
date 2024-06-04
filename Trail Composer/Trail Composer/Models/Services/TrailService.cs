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
        public TrailService(TrailComposerDbContext context)
        {
            _context = context;
        }
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
                    CountryIds = trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList(),
                    SegmentIds = trail.TrailSegments.Select(trailSeg => trailSeg.SegmentId).ToList(),
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
                    CountryIds = trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList(),
                    SegmentIds = trail.TrailSegments.Select(trailSeg => trailSeg.SegmentId).ToList(),
                })
                .ToListAsync();

            return trailList;
        }
        public async Task<IEnumerable<TrailToApi>> GetFilteredTrailListAsync(string userId, int[] countryIds, int minLatitude, int maxLatitude,
           int minLongitude, int maxLongitude)
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
        public async Task<IEnumerable<TrailToApi>> GetFilteredUserTrailListAsync(string userId, int[] countryIds, int minLatitude, int maxLatitude,
            int minLongitude, int maxLongitude)
        {
            var trailList = await _context.Trails
                .Include(trail => trail.TrailTypes)
                .Where(trail => 
                                trail.TcuserId == userId &&
                                (trail.TrailCountries.Any(countryId => countryIds.Contains(countryId.CountryId)) ||
                                (countryIds.Length == 0)) &&
                                (trail.MinLatitude >= minLatitude) &&
                                (trail.MaxLatitude <= maxLatitude) &&
                                (trail.MinLongitude >= minLongitude) &&
                                (trail.MaxLongitude <= maxLongitude)
                            )                            
                .Select(trail => new TrailToApi
                {
                    Id = trail.Id,
                    TcuserId = trail.TcuserId,
                    Name = trail.Name,
                    Username = trail.Tcuser.Name,
                    LevelId = trail.LevelId,
                    CountryIds = trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList(),
                    PathTypeIds = trail.TrailTypes.Select(trailType => trailType.PathType).Select(pathType => pathType.Id).ToList()
                })
                .OrderBy(trail => trail.Id)
                .Take(1000)
                .ToListAsync();

            return trailList;
        }
        public async Task<IEnumerable<TrailToApi>> GetFilteredAllTrailListAsync(int[] countryIds, int minLatitude, int maxLatitude,
            int minLongitude, int maxLongitude)
        {
            var trailList = await _context.Trails
                .Include(trail => trail.TrailTypes)
                .Where(trail =>
                                (trail.TrailCountries.Any(countryId => countryIds.Contains(countryId.CountryId)) ||
                                (countryIds.Length == 0)) &&
                                (trail.MinLatitude >= minLatitude) &&
                                (trail.MaxLatitude <= maxLatitude) &&
                                (trail.MinLongitude >= minLongitude) &&
                                (trail.MaxLongitude <= maxLongitude)
                            )
                .Select(trail => new TrailToApi
                {
                    Id = trail.Id,
                    TcuserId = trail.TcuserId,
                    Name = trail.Name,
                    Username = trail.Tcuser.Name,
                    LevelId = trail.LevelId,
                    CountryIds = trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList(),
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
                    await _context.Tcusers.AddAsync(tcuser);
                }

                // adding Trail

                // finding bounding box
                BoundingBox boundingBox = await FindBoundingBoxAndTotalLengthAsync(trail.SegmentIds);

                var newTrail = new Trail
                {
                    TcuserId = user.Id,
                    Name = trail.Name,
                    Description = trail.Description,
                    MinLongitude = boundingBox.MinLongitude,
                    MaxLongitude = boundingBox.MaxLongitude,
                    MinLatitude = boundingBox.MinLatitude,
                    MaxLatitude = boundingBox.MaxLatitude,
                    TotalLength = boundingBox.TotalLength,
                    Level = level,
                };

                await _context.Trails.AddAsync(newTrail);

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

                        await _context.TrailTypes.AddAsync(trailType);
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

                        await _context.TrailCountries.AddAsync(trailCountry);
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

                        await _context.TrailSegments.AddAsync(trailSegment);
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

                // find new bounding box + total length
                BoundingBox boundingBox = await FindBoundingBoxAndTotalLengthAsync(trailApi.SegmentIds);

                trailDb.Name = trailApi.Name;
                trailDb.Description = trailApi.Description;
                trailDb.MinLongitude = boundingBox.MinLongitude;
                trailDb.MaxLongitude = boundingBox.MaxLongitude;
                trailDb.MinLatitude = boundingBox.MinLatitude;
                trailDb.MaxLatitude = boundingBox.MaxLatitude;
                trailDb.TotalLength = boundingBox.TotalLength;

                trailDb.LevelId = trailApi.LevelId;
                trailDb.Level = trailApiLevel;

                _context.TrailTypes.RemoveRange(trailDb.TrailTypes);
                foreach (var trailTypeApiId in trailApi.PathTypeIds)
                {
                    var trailTypeApi = await _context.PathTypes.FindAsync(trailTypeApiId);
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
                    await _context.TrailTypes.AddAsync(trailPathTypeApi);
                }

                _context.TrailCountries.RemoveRange(trailDb.TrailCountries);
                foreach (var trailCountryApiId in trailApi.CountryIds)
                {
                    var trailCountryApi = await _context.Countries.FindAsync(trailCountryApiId);
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
                    await _context.TrailCountries.AddAsync(newTrailCountryApi);
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

                        await _context.TrailSegments.AddAsync(trailSegment);
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

        // utility functions
        private async Task<BoundingBox> FindBoundingBoxAndTotalLengthAsync (ICollection<int> segmentIds)
        {
            var boundingBoxList = await _context.Segments
                .Where(seg => segmentIds.Contains(seg.Id))
                .Select(seg => new
                {
                    seg.MinLongitude, 
                    seg.MinLatitude,
                    seg.MaxLatitude, 
                    seg.MaxLongitude, 
                    seg.PathLength
                }).ToListAsync();

            BoundingBox result = new()
            {
                MinLongitude = boundingBoxList.Select(bb => bb.MinLongitude).Min(),
                MaxLongitude = boundingBoxList.Select(bb => bb.MaxLongitude).Max(),
                MinLatitude = boundingBoxList.Select(bb => bb.MinLatitude).Min(),
                MaxLatitude = boundingBoxList.Select(bb => bb.MaxLatitude).Max(),
                TotalLength = boundingBoxList.Select(bb => bb.PathLength).Sum()
            };
            return result;
        }

        private class BoundingBox
        {
            public int MinLongitude { get; set; }
            public int MaxLongitude { get; set; }
            public int MinLatitude { get; set; }
            public int MaxLatitude { get; set; }
            public int TotalLength { get; set; }
        }
    }
}
