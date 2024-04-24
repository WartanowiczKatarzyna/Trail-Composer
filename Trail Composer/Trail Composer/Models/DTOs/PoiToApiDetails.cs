namespace Trail_Composer.Models.DTOs
{
    public class PoiToApiDetails : PoiToAPI
    {
        public string? Description { get; set; }
        public string TcuserId { get; set; }
        public ICollection<int> PoiTypeIds { get; set; } = new List<int>();
        public int PhotoId { get; set; }
    }
}
