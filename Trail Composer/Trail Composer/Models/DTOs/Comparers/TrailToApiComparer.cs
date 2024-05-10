namespace Trail_Composer.Models.DTOs.Comparers
{
    public class TrailToApiComparer
    {
        public bool Equals(TrailToApi? x, TrailToApi? y)
        {
            if (ReferenceEquals(x, y))
            {
                return true;
            }

            if (x is null || y is null)
            {
                return false;
            }

            return x.Id == y.Id;
        }

        public int GetHashCode(TrailToApi obj)
        {
            return obj.Id.GetHashCode();
        }
    }
}
