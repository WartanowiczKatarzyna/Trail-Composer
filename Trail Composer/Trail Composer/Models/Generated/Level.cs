using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class Level
{
    public int Id { get; set; }

    public int Name { get; set; }

    public virtual ICollection<Segment> Segments { get; set; } = new List<Segment>();

    public virtual ICollection<Trail> Trails { get; set; } = new List<Trail>();
}
