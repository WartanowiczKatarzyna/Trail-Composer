import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/TrailTable/flattenData";
import {geoRefFloatToIntStr} from "../utils/geoRef";

export const createTrailUserFilteredSlice = (set, get) => ({
  TrailUserFiltered: [],
  TrailUserFilteredSelectedCountries: [],
  TrailUserFilteredMinLatitude: -90,
  TrailUserFilteredMaxLatitude: 90,
  TrailUserFilteredMinLongitude: -180,
  TrailUserFilteredMaxLongitude: 180,
  TrailUserAfterSearch: false,

  fetchTrailUserFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                               pca, account) => {
      set({ TrailUserFilteredSelectedCountries: [...selectedCountries] });
      set({ TrailUserFilteredMinLatitude: minLatitude });
      set({ TrailUserFilteredMaxLatitude: maxLatitude });
      set({ TrailUserFilteredMinLongitude: minLongitude });
      set({ TrailUserFilteredMaxLongitude: maxLongitude });
      await fetchTrailUserFilteredExecute(set, get, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
        pca, account);
  },

  refreshTrailUserFiltered: async (pca, account) => {
    console.info('get.TrailUserFiltered: ', get().TrailUserFiltered);
    if(get().TrailUserFiltered.length > 0) {
      await fetchTrailUserFilteredExecute(set, get, get().TrailUserFilteredSelectedCountries, get().TrailUserFilteredMinLatitude,
        get().TrailUserFilteredMaxLatitude, get().TrailUserFilteredMinLongitude, get().TrailUserFilteredMaxLongitude,
        pca, account);
    }
  },

})

const fetchTrailUserFilteredExecute = async (set, get, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                                           pca, account) => {

  const countryIds = selectedCountries.map((country) => country.id);
  const authHeader = await getAuthHeader(pca, account);

  const url = new URL('http://localhost');
  const queryParams1 = { countryIds };
  const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
  queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
  Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, geoRefFloatToIntStr(value)));
  const urlRelative = `tc-api/Trail/list/user/filtered${url.search}`;
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
        set({TrailUserAfterSearch: true});
        return response.json();
      }
      else
        console.log(response.status);
    })
    .then(data => {
      console.info('incoming data: ', data);
      set({TrailUserFiltered: flattenData(data,  get().CountryNamesMap, get().pathTypes, get().pathLevels)});
    })
    .catch(error => {
      console.log(error);
    });
}
