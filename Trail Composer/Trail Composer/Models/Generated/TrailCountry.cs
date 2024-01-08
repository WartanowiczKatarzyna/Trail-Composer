using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class TrailCountry
{
    public int Id { get; set; }

    public int CountryId { get; set; }

    public int TrailId { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual Trail Trail { get; set; } = null!;
}
