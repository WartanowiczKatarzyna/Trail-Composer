using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Poiphoto
{
    public int Id { get; set; }

    public int PoiId { get; set; }

    public byte[] Photo { get; set; } = null!;

    public bool Deleted { get; set; }

    public virtual Poi Poi { get; set; } = null!;
}
