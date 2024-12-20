﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using System.Data.SqlClient;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;
using System.Data.SqlTypes;
using Microsoft.SqlServer.Types;
using NetTopologySuite.Triangulate;

namespace Trail_Composer.Models.Services
{
    public class SegmentService
    {
        private readonly TrailComposerDbContext _context;

        public SegmentService(TrailComposerDbContext context)
        {
            _context = context;
        }

        public async Task<SegmentToApi> GetSegmentByIdAsync(int id)
        {            
            var segment = await _context.Segments
                .Include(seg => seg.SegmentPois)
                .Select(seg => new SegmentToApi
                {
                    Id = seg.Id,
                    TcuserId = seg.TcuserId,
                    Name = seg.Name,
                    Username = seg.Tcuser.Name,
                    Description = seg.Description,
                    PathLength = seg.PathLength,
                    CountryId = seg.CountryId,
                    LevelId = seg.LevelId,
                    PathTypeIds = seg.SegmentTypes.Select(segType => segType.PathType).Select(pathType => pathType.Id).ToList(),
                    PoiIds = seg.SegmentPois.Select(segPoi => segPoi.PoiId).ToList(),
                })
                .Where(seg => seg.Id == id)
                .SingleOrDefaultAsync();

            return segment;
        }
        public async Task<SegmentToApiWithGpx> GetSegmentWithGpxByIdAsync(int id)
        {
            var segment = await _context.Segments
                .Include(seg => seg.SegmentPois)
                .Select(seg => new SegmentToApiWithGpx
                {
                    Id = seg.Id,
                    Name = seg.Name,
                    Gpx = seg.GpxFile
                })
                .Where(seg => seg.Id == id)
                .SingleOrDefaultAsync();

            return segment;
        }
        public async Task<IEnumerable<SegmentToApi>> GetUserSegmentListAsync(string userId)
        {
            var segmentList = await _context.Segments
                .Include(seg => seg.SegmentTypes)
                .Where(seg => seg.TcuserId == userId)
                .Select(seg => new SegmentToApi
                {
                    Id = seg.Id,
                    TcuserId = seg.TcuserId,
                    Name = seg.Name,
                    Username = seg.Tcuser.Name,
                    CountryId = seg.CountryId,
                    LevelId = seg.LevelId,
                    PathLength = seg.PathLength,
                    PathTypeIds = seg.SegmentTypes.Select(segType => segType.PathType).Select(pathType => pathType.Id).ToList(),
                    PoiIds = seg.SegmentPois.Select(segPoi => segPoi.PoiId).ToList(),
                })
                .ToListAsync();

            return segmentList;
        }
        public async Task<IEnumerable<SegmentToApi>> GetFilteredSegmentListAsync(string userId, int[] countryIds, int minLatitude, int maxLatitude,
            int minLongitude, int maxLongitude)
        {
            var segmentList = await _context.Segments
                .Include(segment => segment.SegmentTypes)
                .Where(segment => (
                                segment.TcuserId != userId &&
                                (countryIds.Contains(segment.CountryId) || (countryIds.Length == 0)) &&
                                (segment.MinLatitude > minLatitude) &&
                                (segment.MaxLatitude < maxLatitude) &&
                                (segment.MinLongitude > minLongitude) &&
                                (segment.MaxLongitude < maxLongitude)
                            ))
                .Select(seg => new SegmentToApi
                {
                    Id = seg.Id,
                    TcuserId = seg.TcuserId,
                    Name = seg.Name,
                    Username = seg.Tcuser.Name,
                    PathLength = seg.PathLength,
                    CountryId = seg.CountryId,
                    LevelId = seg.LevelId,
                    PathTypeIds = seg.SegmentTypes.Select(segType => segType.PathType).Select(pathType => pathType.Id).ToList()
                })
                .OrderBy(seg => seg.Id)
                .Take(1000)
                .ToListAsync();

            return segmentList;
        }
        public async Task<IEnumerable<SegmentToApi>> GetFilteredUserSegmentListAsync(string userId, int[] countryIds, int minLatitude, int maxLatitude,
            int minLongitude, int maxLongitude)
        {            
            var segmentList = await _context.Segments
                .Include(segment => segment.SegmentTypes)
                .Where(segment => (
                                segment.TcuserId == userId &&
                                (countryIds.Contains(segment.CountryId) || (countryIds.Length == 0)) &&
                                (segment.MinLatitude > minLatitude) &&
                                (segment.MaxLatitude < maxLatitude) &&
                                (segment.MinLongitude > minLongitude) &&
                                (segment.MaxLongitude < maxLongitude)
                            ))
                .Select(seg => new SegmentToApi
                {
                    Id = seg.Id,
                    TcuserId = seg.TcuserId,
                    Name = seg.Name,
                    Username = seg.Tcuser.Name,
                    PathLength = seg.PathLength,
                    CountryId = seg.CountryId,
                    LevelId = seg.LevelId,
                    PathTypeIds = seg.SegmentTypes.Select(segType => segType.PathType).Select(pathType => pathType.Id).ToList()
                })
                .OrderBy(seg => seg.Id)
                .Take(1000)
                .ToListAsync();

            return segmentList;
        }
        public async Task<IEnumerable<SegmentToApi>> GetSegmentListByTrailAsync(int trailId)
        {
            var segmentList = await _context.Segments
                .Include(seg => seg.SegmentTypes)
                .Include(seg => seg.Tcuser)
                .Join(
                    _context.TrailSegments,
                    seg => seg.Id,
                    ts => ts.SegmentId
                    ,
                    (seg, ts) => new { seg, ts }
                )
                .Where(mergedElem => mergedElem.ts.TrailId == trailId)
                .OrderBy(mergedElem => mergedElem.ts.SegmentOrder)
                .Select(mergedElem => new SegmentToApi
                {
                    Id = mergedElem.seg.Id,
                    TcuserId = mergedElem.seg.TcuserId,
                    Name = mergedElem.seg.Name,
                    Username = mergedElem.seg.Tcuser.Name,
                    CountryId = mergedElem.seg.CountryId,
                    LevelId = mergedElem.seg.LevelId,
                    PathLength = mergedElem.seg.PathLength,
                    PathTypeIds = mergedElem.seg.SegmentTypes.Select(segType => segType.PathType).Select(pathType => pathType.Id).ToList(),
                    PoiIds = mergedElem.seg.SegmentPois.Select(segPoi => segPoi.PoiId).ToList(),
                })
                .ToListAsync();

            return segmentList;
        }
        public async Task<byte[]> GetGpx(int segmentId)
        {
            var segment = await _context.Segments.FirstOrDefaultAsync(s => s.Id == segmentId);

            if (segment == null || segment.GpxFile == null)
            {
                return Array.Empty<byte>();
            }

            return segment.GpxFile;
        }
        public async Task<int> AddSegmentAsync(SegmentFromAPI segment, TCUserDTO user)
        {
            if (segment.Gpx == null || segment.Gpx.Length < 1 || segment.PoiIds?.Count > 100)
                return -2;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var country = await _context.Countries.FindAsync(segment.CountryId);
                var level = await _context.PathLevels.FindAsync(segment.LevelId);
                var tcuser = await _context.Tcusers.FindAsync(user.Id);

                if (country == null ||  level == null)
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

                // adding Segment
                var newSegment = new Generated.Segment
                {
                    TcuserId = user.Id,
                    CountryId = segment.CountryId,
                    Name = segment.Name,
                    Description = segment.Description,
                    GpxFile = GetFileContent(segment.Gpx),
                    PathLength = segment.PathLength,
                    MinLongitude = segment.MinLongitude.GetValueOrDefault(),
                    MaxLongitude = segment.MaxLongitude.GetValueOrDefault(),
                    MinLatitude = segment.MinLatitude.GetValueOrDefault(),
                    MaxLatitude = segment.MaxLatitude.GetValueOrDefault(),
                    Country = country,
                    Level = level,
                };

                await _context.Segments.AddAsync(newSegment);

                // adding Segment - Pathtype relations
                foreach (var typeId in segment.PathTypeIds)
                {
                    var type = await _context.PathTypes.FindAsync(typeId);
                
                    if (type != null)
                    {
                        var segmentType = new SegmentType
                        {
                            SegmentId = newSegment.Id,
                            PathTypeId = type.Id,
                            Segment = newSegment,
                            PathType = type
                        };

                        await _context.SegmentTypes.AddAsync(segmentType);
                    }
                }

                // adding Segment - Poi relations
                if (segment.PoiIds != null)
                {
                    for (int i = 0; i < segment.PoiIds.Count; i++)
                    {
                        var poi = await _context.Pois.FindAsync(segment.PoiIds.ElementAt(i));

                        if (poi == null)
                            continue;

                        var segmentPoi = new SegmentPoi
                        {
                            SegmentId = newSegment.Id,
                            PoiId = poi.Id,
                            PoiOrder = i,

                            Segment = newSegment,
                            Poi = poi
                        };

                        await _context.SegmentPois.AddAsync(segmentPoi);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return newSegment.Id;
           
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return -1;
            }
        }
        public async Task<bool> EditSegmentAsync(int segId, SegmentFromAPI segApi, string userId)
        {
            if (segApi.PoiIds?.Count > 100)
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var segDb = await _context.Segments
                    .Include(s => s.SegmentTypes)
                    .Include(s => s.SegmentPois)
                    .FirstOrDefaultAsync(s => s.Id == segId && s.TcuserId == userId);
                var segApiCountry = await _context.Countries.FindAsync(segApi.CountryId);
                var segApiLevel = await _context.PathLevels.FindAsync(segApi.LevelId);

                if (segDb == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("EditSegmentAsync error: couldn't find segment;");
                    return false;
                }
                else if (segApiCountry == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("EditSegmentAsync error: couldn't find country;");
                    return false;
                }
                else if (segApiLevel == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("EditSegmentAsync error: couldn't find level;");
                    return false;
                }

                segDb.Name = segApi.Name;
                segDb.Description = segApi.Description; 

                if (segApi.Gpx != null && segApi.Gpx.Length > 0)
                {
                    segDb.GpxFile = GetFileContent(segApi.Gpx);
                    segDb.MinLongitude = segApi.MinLongitude.GetValueOrDefault();
                    segDb.MaxLongitude = segApi.MaxLongitude.GetValueOrDefault();
                    segDb.MinLatitude = segApi.MinLatitude.GetValueOrDefault();
                    segDb.MaxLatitude = segApi.MaxLatitude.GetValueOrDefault();
                    segDb.PathLength = segApi.PathLength;
                }                    

                segDb.LevelId = segApi.LevelId;
                segDb.Level = segApiLevel;

                segDb.CountryId = segApi.CountryId;
                segDb.Country = segApiCountry;

                _context.SegmentTypes.RemoveRange(segDb.SegmentTypes);
                foreach (var segTypeApiId in segApi.PathTypeIds)
                {
                    var segTypeApi = _context.PathTypes.Find(segTypeApiId);
                    if (segTypeApi == null)
                    {
                        await transaction.RollbackAsync();
                        Log.Error($"EditSegmentAsync error: segmentType with id {segTypeApi} doesn't exist;");
                        return false;
                    }

                    var segPathTypeApi = new SegmentType
                    {
                        SegmentId = segId,
                        PathTypeId = segTypeApiId,

                        Segment = segDb,
                        PathType = segTypeApi
                    };
                    await _context.SegmentTypes.AddAsync(segPathTypeApi);
                }

                _context.SegmentPois.RemoveRange(segDb.SegmentPois);
                if (segApi.PoiIds != null)
                {
                    for (int i = 0; i < segApi.PoiIds.Count; i++)
                    {
                        var poi = await _context.Pois.FindAsync(segApi.PoiIds.ElementAt(i));

                        if (poi == null)
                            continue;

                        var segmentPoi = new SegmentPoi
                        {
                            SegmentId = segId,
                            PoiId = poi.Id,
                            PoiOrder = i,

                            Segment = segDb,
                            Poi = poi
                        };

                        await _context.SegmentPois.AddAsync(segmentPoi);
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
        public async Task<bool> DeleteSegmentAsync(int id, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var seg = await _context.Segments
                    .Include(seg => seg.SegmentTypes)
                    .Include(seg => seg.SegmentPois)
                    .Include(seg => seg.TrailSegments)
                    .FirstOrDefaultAsync(seg => seg.Id == id && seg.TcuserId == userId);

                if (seg == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("DeleteSegmentAsync error: segment is null");
                    return false;
                }

                _context.SegmentTypes.RemoveRange(seg.SegmentTypes);
                _context.SegmentPois.RemoveRange(seg.SegmentPois);
                _context.TrailSegments.RemoveRange(seg.TrailSegments);
                _context.Segments.Remove(seg);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Log.Error($"DeleteSegmentAsync error: {ex.Message}");
            }
            return false;
        }

        //utility methods
        private byte[] GetFileContent(IFormFile file)
        {
            if (file != null && file.Length > 0)
            {
                using var stream = new MemoryStream();
                file.CopyTo(stream);
                byte[] fileContent = stream.ToArray();

                return fileContent;
            }

            throw new Exception("Can't read gpx file!");
        }
    }
}
