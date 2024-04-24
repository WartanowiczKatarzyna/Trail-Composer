using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Trail_Composer.Data;
using Trail_Composer.Models.DTOs;
using Trail_Composer.Models.Generated;

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
                    Description = seg.Description,
                    CountryId = seg.CountryId,
                    Level = seg.LevelId,
                    PathTypes = seg.SegmentTypes.Select(segType => segType.PathType).Select(pathType => pathType.Id).ToList(),
                    PoiIds = seg.SegmentPois.Select(segPoi => segPoi.Id).ToList(),
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
        public async Task<byte[]> GetGpx(int segmentId)
        {
            var segment = await _context.Segments.FirstOrDefaultAsync(s => s.Id == segmentId);

            if (segment == null || segment.GpxFile == null)
            {
                return null;
            }

            return segment.GpxFile;
        }
        public async Task<int> AddSegmentAsync(SegmentFromAPI segment, TCUserDTO user)
        {
            if (segment.Gpx == null || segment.Gpx.Length < 1)
                return -2;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var country = await _context.Countries.FindAsync(segment.CountryId);
                var level = await _context.PathLevels.FindAsync(segment.Level);
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
                    _context.Tcusers.Add(tcuser);
                }


                // adding Segment
                var newSegment = new Segment
                {
                    TcuserId = user.Id,
                    CountryId = segment.CountryId,
                    Name = segment.Name,
                    Description = segment.Description,
                    GpxFile = GetFileContent(segment.Gpx),
                        
                    Country = country,
                    Level = level,
                };

                _context.Segments.Add(newSegment);

                // adding Segment - Pathtype relations
                foreach (var typeId in segment.PathTypes)
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

                        _context.SegmentTypes.Add(segmentType);
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

                        _context.SegmentPois.Add(segmentPoi);
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var segDb = await _context.Segments
                    .Include(s => s.SegmentTypes)
                    .Include(s => s.SegmentPois)
                    .FirstOrDefaultAsync(s => s.Id == segId && s.TcuserId == userId);
                var segApiCountry = await _context.Countries.FindAsync(segApi.CountryId);
                var segApiLevel = await _context.PathLevels.FindAsync(segApi.Level);

                if (segDb == null)
                {
                    await transaction.RollbackAsync();
                    Log.Error("EditSegmentAsync error: couldn't find poi;");
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
                    segDb.GpxFile = GetFileContent(segApi.Gpx);

                segDb.LevelId = segApi.Level;
                segDb.Level = segApiLevel;

                segDb.CountryId = segApi.CountryId;
                segDb.Country = segApiCountry;

                _context.SegmentTypes.RemoveRange(segDb.SegmentTypes);
                foreach (var segTypeApiId in segApi.PathTypes)
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
                    _context.SegmentTypes.Add(segPathTypeApi);
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

                        _context.SegmentPois.Add(segmentPoi);
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
