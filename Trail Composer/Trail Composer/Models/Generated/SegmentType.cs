using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class SegmentType
{
    public int Id { get; set; }

    public int PathTypeId { get; set; }

    public int SegmentId { get; set; }

    public virtual PathType PathType { get; set; } = null!;

    public virtual Segment Segment { get; set; } = null!;
}
