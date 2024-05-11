using Trail_Composer.Models.Generated;

namespace Trail_Composer.Models.DTOs
{
    public class PoiToAPI
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string Username { get; set; }
        public int CountryId { get; set; }         
        public int Longitude { get; set; }  //długość geograficzna
        public int Latitude { get; set; }   //szerokość geograficzna

        public override bool Equals(object? obj)
        {
            if (obj == null || !(obj is PoiToAPI))
            {
                return false;
            }

            var other = (PoiListElementToApi)obj;
            return this.Id == other.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
