using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.DTOs
{
    public class PoiToAPI
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string TcuserId { get; set; }
        public int CountryId { get; set; }
        public ICollection<int> PoiTypes { get; set; } = new List<int>();          
        public decimal Longitude { get; set; }  //długość geograficzna
        public decimal Latitude { get; set; }   //szerokość geograficzna
    }
}
