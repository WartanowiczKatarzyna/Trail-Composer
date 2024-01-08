using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Poi
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CountryId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public string? Description { get; set; }

    public bool Deleted { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual ICollection<PoiPoitype> PoiPoitypes { get; set; } = new List<PoiPoitype>();

    public virtual ICollection<Poiphoto> Poiphotos { get; set; } = new List<Poiphoto>();

    public virtual ICollection<SegmentPoi> SegmentPois { get; set; } = new List<SegmentPoi>();

    public virtual Tcuser User { get; set; } = null!;
}
