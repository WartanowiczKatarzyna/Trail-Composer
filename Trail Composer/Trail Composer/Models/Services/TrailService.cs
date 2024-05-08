﻿using NetTopologySuite.Triangulate;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.Services
{
    public class TrailService
    {
        private readonly TrailComposerDbContext _context;

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