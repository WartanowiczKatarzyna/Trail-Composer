namespace Trail_Composer.Models.DTOs
{
    public class PoiListElementToApi : PoiToAPI
    {
        public ICollection<int> PoiTypeIds { get; set; } = new List<int>();
    }
}
