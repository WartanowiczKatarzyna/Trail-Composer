namespace Trail_Composer.Models.DTOs
{
    public class SegmentFromAPI
    {
        public required string Name { get; set; }
        public required int CountryId { get; set; }
        public ICollection<int> PathTypeIds { get; set; }

        public required int LevelId { get; set; }
        public string? Description { get; set; }
        public int PathLength { get; set; }

        public IFormFile? Gpx{ get; set; }
        public ICollection<int>? PoiIds { get; set; }

        public int MaxLatitude { get; set; }
        public int MaxLongitude { get; set; }
        public int MinLatitude { get; set; }
        public int MinLongitude { get; set; }
    }
}
