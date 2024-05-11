using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.DTOs
{
    public class PoiFromAPI
    {
        public required string Name { get; set; }
        public int CountryId { get; set; }
        public ICollection<int> PoiTypeIds { get; set; } = new List<int>();          
        public int Longitude { get; set; }  //długość geograficzna
        public int Latitude { get; set; }   //szerokość geograficzna
        public string? Description { get; set; }

        public IFormFile? Photo { get; set; }
        public int? DeletePhoto { get; set; }

    }
}
