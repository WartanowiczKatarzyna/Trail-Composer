using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Poitype
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<PoiPoitype> PoiPoitypes { get; set; } = new List<PoiPoitype>();
}
