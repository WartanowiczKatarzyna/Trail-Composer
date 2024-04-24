namespace Trail_Composer.Models.DTOs
{
    public class SegmentToApi
    {
        public required int Id { get; set; }
        public string TcuserId { get; set; }
        public required string Name { get; set; }
        public int CountryId { get; set; }
        public ICollection<int> PathTypes { get; set; } = new HashSet<int>();

        public int Level { get; set; }
        public required string Description { get; set; }

        public ICollection<int> PoiIds { get; set; } = new HashSet<int>();

        public override bool Equals(object? obj)
        {
            if (obj == null || !(obj is SegmentToApi))
            {
                return false;
            }

            var other = (SegmentToApi)obj;
            return this.Id == other.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
