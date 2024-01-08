using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class PoiPoitype
{
    public int Id { get; set; }

    public int PoiId { get; set; }

    public int PoitypeId { get; set; }

    public virtual Poi Poi { get; set; } = null!;

    public virtual Poitype Poitype { get; set; } = null!;
}
