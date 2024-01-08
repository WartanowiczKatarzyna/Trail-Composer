using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class SegmentType
{
    public int Id { get; set; }

    public int TypeId { get; set; }

    public int SegmentId { get; set; }

    public virtual Segment Segment { get; set; } = null!;

    public virtual PathType Type { get; set; } = null!;
}
