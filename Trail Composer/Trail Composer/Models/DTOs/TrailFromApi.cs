using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.DTOs
{
    public class TrailFromApi
    {
        public int LevelId { get; set; }

        public string Name { get; set; } 

        public int TotalLength { get; set; }

        public string? Description { get; set; }

        public decimal MinLongitude { get; set; }

        public decimal MaxLongitude { get; set; }

        public decimal MinLatitude { get; set; }

        public decimal MaxLatitude { get; set; }

        public ICollection<int> CountryIds { get; set; } = new List<int>();
        public ICollection<int> PathTypeIds { get; set; } = new List<int>();
        public ICollection<int> SegmentIds { get; set; } = new List<int>();
    }
}
