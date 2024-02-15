using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class TrailType
{
    public int Id { get; set; }

    public int PathTypeId { get; set; }

    public int TrailId { get; set; }

    public virtual PathType PathType { get; set; } = null!;

    public virtual Trail Trail { get; set; } = null!;
}
