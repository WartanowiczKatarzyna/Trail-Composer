namespace Trail_Composer.Models.DTOs
{
    public class SegmentToApiWithGpx
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public byte[] Gpx { get; set; }
    }
}
