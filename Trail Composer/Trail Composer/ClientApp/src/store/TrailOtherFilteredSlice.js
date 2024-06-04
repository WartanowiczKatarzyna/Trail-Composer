import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/TrailTable/flattenData";
import {geoRefFloatToIntStr} from "../utils/geoRef";

export const createTrailOtherFilteredSlice = (set, get) => ({
  TrailOtherFiltered: [],
  TrailOtherFilteredSelectedCountries: [],
  TrailOtherFilteredMinLatitude: -90,
  TrailOtherFilteredMaxLatitude: 90,
  TrailOtherFilteredMinLongitude: -180,
  TrailOtherFilteredMaxLongitude: 180,
  TrailOtherAfterSearch: false,
  
  saveTrailOtherGeoSearchOptions: (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    set({ TrailOtherFilteredSelectedCountries: [...selectedCountries] });
    set({ TrailOtherFilteredMinLatitude: minLatitude });
    set({ TrailOtherFilteredMaxLatitude: maxLatitude });
    set({ TrailOtherFilteredMinLongitude: minLongitude });
    set({ TrailOtherFilteredMaxLongitude: maxLongitude });
  },
  
  fetchTrailOtherFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
    pca, account) => {
      set({ TrailOtherFilteredSelectedCountries: [...selectedCountries] });
      set({ TrailOtherFilteredMinLatitude: minLatitude });
      set({ TrailOtherFilteredMaxLatitude: maxLatitude });
      set({ TrailOtherFilteredMinLongitude: minLongitude });
      set({ TrailOtherFilteredMaxLongitude: maxLongitude });

      const countryIds = selectedCountries.map((country) => country.id);
      const authHeader = await getAuthHeader(pca, account);

      const url = new URL('http://localhost');
      const queryParams1 = { countryIds };
      const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
      queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
      Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, geoRefFloatToIntStr(value)));
      const urlRelative = `tc-api/Trail/list/filtered${url.search}`;
      console.info('urlRelative: ', urlRelative);

      fetch(urlRelative,
      {
        method: "GET",
        headers: {
          Authorization: authHeader
        }
      })
      .then(response => {
        if (response.status){
          set({TrailOtherAfterSearch: true});
          return response.json();
        }
        else
          console.log(response.status);
      })
      .then(data => {
        console.info('incoming data: ', data);
        set({TrailOtherFiltered: flattenData(data, get().CountryNamesMap, get().pathTypes, get().pathLevels)});
      })
      .catch(error => {
        console.log(error);
      });
    },
})
