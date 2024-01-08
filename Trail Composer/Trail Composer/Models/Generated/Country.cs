using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Country
{
    public int Id { get; set; }

    public string CountryCode { get; set; } = null!;

    public string CountryName { get; set; } = null!;

    public virtual ICollection<Poi> Pois { get; set; } = new List<Poi>();

    public virtual ICollection<Segment> Segments { get; set; } = new List<Segment>();

    public virtual ICollection<TrailCountry> TrailCountries { get; set; } = new List<TrailCountry>();
}
