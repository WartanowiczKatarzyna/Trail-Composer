using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Segment
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int LevelId { get; set; }

    public int CountryId { get; set; }

    public int Length { get; set; }

    public string? Desciption { get; set; }

    public string GpxFile { get; set; } = null!;

    public bool Deleted { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual PathLevel Level { get; set; } = null!;

    public virtual ICollection<SegmentPoi> SegmentPois { get; set; } = new List<SegmentPoi>();

    public virtual ICollection<SegmentType> SegmentTypes { get; set; } = new List<SegmentType>();

    public virtual ICollection<TrailSegment> TrailSegments { get; set; } = new List<TrailSegment>();

    public virtual Tcuser User { get; set; } = null!;
}
