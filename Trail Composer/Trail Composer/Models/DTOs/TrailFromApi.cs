using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.DTOs
{
    public class TrailFromApi
    {
        public int LevelId { get; set; }

        public string Name { get; set; } 

        public int TotalLength { get; set; }

        public string? Description { get; set; }

        public int? MinLongitude { get; set; }

        public int? MaxLongitude { get; set; }

        public int? MinLatitude { get; set; }

        public int? MaxLatitude { get; set; }

        public ICollection<int> CountryIds { get; set; } = new List<int>();
        public ICollection<int> PathTypeIds { get; set; } = new List<int>();
        public ICollection<int> SegmentIds { get; set; } = new List<int>();
    }
}
