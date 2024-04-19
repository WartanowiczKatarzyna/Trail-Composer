namespace Trail_Composer.Models.DTOs
{
    public class SegmentFromAPI
    {
        public required string Name { get; set; }
        public required int CountryId { get; set; }
        public ICollection<int> PathTypes { get; set; }

        public required int Level { get; set; }
        public string? Description { get; set; }

        public required IFormFile Gpx{ get; set; }
        public ICollection<int>? PoiIds { get; set; }
    }
}
