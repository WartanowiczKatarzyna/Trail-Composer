using Microsoft.AspNetCore.Mvc;
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

        public async Task<int> AddSegmentAsync(SegmentFromAPI segment, TCUserDTO user)
        {
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
