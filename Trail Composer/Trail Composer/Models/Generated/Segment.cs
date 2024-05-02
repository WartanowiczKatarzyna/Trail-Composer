using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Segment
{
    public int Id { get; set; }

    public string TcuserId { get; set; } = null!;

    public int LevelId { get; set; }

    public int CountryId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public byte[] GpxFile { get; set; } = null!;

    public decimal MinLongitude { get; set; }

    public decimal MaxLongitude { get; set; }

    public decimal MinLatitude { get; set; }

    public decimal MaxLatitude { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual PathLevel Level { get; set; } = null!;

    public virtual ICollection<SegmentPoi> SegmentPois { get; set; } = new List<SegmentPoi>();

    public virtual ICollection<SegmentType> SegmentTypes { get; set; } = new List<SegmentType>();

    public virtual Tcuser Tcuser { get; set; } = null!;

    public virtual ICollection<TrailSegment> TrailSegments { get; set; } = new List<TrailSegment>();
}
