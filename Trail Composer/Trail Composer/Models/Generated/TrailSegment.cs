using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class TrailSegment
{
    public int Id { get; set; }

    public int TrailId { get; set; }

    public int SegmentId { get; set; }

    public int SegmentOrder { get; set; }

    public virtual Segment Segment { get; set; } = null!;

    public virtual Trail Trail { get; set; } = null!;
}
