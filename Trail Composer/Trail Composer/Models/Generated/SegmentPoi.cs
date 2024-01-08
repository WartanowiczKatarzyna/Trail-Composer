using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class SegmentPoi
{
    public int Id { get; set; }

    public int SegmentId { get; set; }

    public int PoiId { get; set; }

    public virtual Poi Poi { get; set; } = null!;

    public virtual Segment Segment { get; set; } = null!;
}
