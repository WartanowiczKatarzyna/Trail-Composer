using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class TrailType
{
    public int Id { get; set; }

    public int TypeId { get; set; }

    public int TrailId { get; set; }

    public virtual Trail Trail { get; set; } = null!;

    public virtual PathType Type { get; set; } = null!;
}
