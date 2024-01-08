using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Trail
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int LevelId { get; set; }

    public int TotalLength { get; set; }

    public string? Description { get; set; }

    public bool Deleted { get; set; }

    public virtual PathLevel Level { get; set; } = null!;

    public virtual ICollection<TrailCountry> TrailCountries { get; set; } = new List<TrailCountry>();

    public virtual ICollection<TrailSegment> TrailSegments { get; set; } = new List<TrailSegment>();

    public virtual ICollection<TrailType> TrailTypes { get; set; } = new List<TrailType>();

    public virtual Tcuser User { get; set; } = null!;
}
