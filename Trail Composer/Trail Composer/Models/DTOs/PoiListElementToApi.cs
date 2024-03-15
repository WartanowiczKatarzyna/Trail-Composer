namespace Trail_Composer.Models.DTOs
{
    public class PoiListElementToApi : PoiToAPI
    {
        public string Username { get; set; }
        public ICollection<int> PoiTypeIds { get; set; } = new List<int>();
    }
}
