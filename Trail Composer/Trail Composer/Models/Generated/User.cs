using System;
using System.Collections.Generic;

namespace Trail_Composer.Models.Generated;

public partial class User
{
    public int Id { get; set; }

    public string Login { get; set; } = null!;

    public string Email { get; set; } = null!;

    public virtual ICollection<Poi> Pois { get; set; } = new List<Poi>();

    public virtual ICollection<Segment> Segments { get; set; } = new List<Segment>();

    public virtual ICollection<Trail> Trails { get; set; } = new List<Trail>();
}
