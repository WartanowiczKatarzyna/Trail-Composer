using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class PathType
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<SegmentType> SegmentTypes { get; set; } = new List<SegmentType>();

    public virtual ICollection<TrailType> TrailTypes { get; set; } = new List<TrailType>();
}
