namespace Trail_Composer.Models.DTOs
{
    public class SegmentFromAPI
    {
        public required string Name { get; set; }
        public required int CountryId { get; set; }
        public ICollection<int> PathTypeIds { get; set; }

        public required int LevelId { get; set; }
        public string? Description { get; set; }

        public IFormFile? Gpx{ get; set; }
        public ICollection<int>? PoiIds { get; set; }

        public decimal MaxLatitude { get; set; }
        public decimal MaxLongitude { get; set; }
        public decimal MinLatitude { get; set; }
        public decimal MinLongitude { get; set; }
    }
}
