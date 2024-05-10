using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Triangulate;
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
                .Where(trail => (
                                trail.TcuserId != userId &&
                                (trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList().Intersect(countryIds).Any() || 
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
        public async Task<IEnumerable<SegmentToApi>> GetFilteredUserTrailListAsync(string userId, int[] countryIds, decimal minLatitude, decimal maxLatitude,
            decimal minLongitude, decimal maxLongitude)
        {
            var trailList = await _context.Trails
                .Include(trail => trail.TrailTypes)
                .Where(trail => (
                                trail.TcuserId == userId &&
                                (trail.TrailCountries.Select(trailCountry => trailCountry.CountryId).ToList().Intersect(countryIds).Any() ||
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
    }
}
