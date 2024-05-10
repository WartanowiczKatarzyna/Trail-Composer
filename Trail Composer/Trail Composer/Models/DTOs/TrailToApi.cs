namespace Trail_Composer.Models.DTOs
{
    public class TrailToApi
    {
        public required int Id { get; set; }
        public string TcuserId { get; set; }
        public required string Name { get; set; }
        public string Username { get; set; }
        public int LevelId { get; set; }
        public int TotalLength { get; set; }
        public string? Description { get; set; }
        public ICollection<int> SegmentIds { get; set; } = new HashSet<int>();
        public ICollection<int> CountryIds { get; set; } = new HashSet<int>();
        public ICollection<int> PathTypeIds { get; set; } = new HashSet<int>();

        public override bool Equals(object? obj)
        {
            if (obj == null || !(obj is TrailToApi))
            {
                return false;
            }

            var other = (TrailToApi)obj;
            return this.Id == other.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
}
