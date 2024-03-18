namespace Trail_Composer.Models.DTOs.Comparers
{
    public class PoiToApiComparer : IEqualityComparer<PoiToAPI>
    {
        public bool Equals(PoiToAPI? x, PoiToAPI? y)
        {
            if (ReferenceEquals(x, y))
            {
                return true;
            }

            if (x is null || y is null)
            {
                return false;
            }

            return x.Id == y.Id; // Customize this comparison based on your equality criteria
        }

        public int GetHashCode(PoiToAPI obj)
        {
            return obj.Id.GetHashCode(); // Customize this if necessary
        }
    }
}
