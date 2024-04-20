namespace Trail_Composer.Models.DTOs.Comparers
{
    public class SegmentToApiComparer
    {
        public bool Equals(SegmentToApi? x, SegmentToApi? y)
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

        public int GetHashCode(SegmentToApi obj)
        {
            return obj.Id.GetHashCode();
        }
    }
}
