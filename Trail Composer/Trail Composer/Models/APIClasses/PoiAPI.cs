using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.APIClasses
{
    public class PoiAPI
    {
        public int? Id { get; set; }
        public int UserId { get; set; }
        public required string Name { get; set; }
        public int CountryId { get; set; }
        public ICollection<int> PoiTypes { get; set; } = new List<int>();          
        public decimal Longitude { get; set; }  //długość geograficzna
        public decimal Latitude { get; set; }   //szerokość geograficzna
        public string? Description { get; set; }

        public IFormFile? Photo { get; set; }

    }
}
