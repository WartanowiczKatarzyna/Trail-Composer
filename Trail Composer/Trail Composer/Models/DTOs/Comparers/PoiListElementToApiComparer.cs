﻿namespace Trail_Composer.Models.DTOs.Comparers
{
    public class PoiListElementToApiComparer : IEqualityComparer<PoiListElementToApi>
    {
        public bool Equals(PoiListElementToApi? x, PoiListElementToApi? y)
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

        public int GetHashCode(PoiListElementToApi obj)
        {
            return obj.Id.GetHashCode();
        }
    }
}
