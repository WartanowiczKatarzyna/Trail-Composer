﻿namespace Trail_Composer.Models.DTOs
{
    public class SegmentToApi
    {
        public required int Id { get; set; }
        public string TcuserId { get; set; }
        public required string Name { get; set; }
        public string Username { get;set; }
        public int PathLength { get; set; }
        public int CountryId { get; set; }
        public ICollection<int> PathTypeIds { get; set; } = new HashSet<int>();

        public int LevelId { get; set; }
        public string? Description { get; set; }

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
