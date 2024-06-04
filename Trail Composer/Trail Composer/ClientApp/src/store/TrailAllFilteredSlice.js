import { flattenData } from "../components/tables/TrailTable/flattenData";
import {geoRefFloatToIntStr} from "../utils/geoRef";

export const createTrailAllFilteredSlice = (set, get) => ({
  TrailAllFiltered: [],
  TrailAllFilteredSelectedCountries: [],
  TrailAllFilteredMinLatitude: -90,
  TrailAllFilteredMaxLatitude: 90,
  TrailAllFilteredMinLongitude: -180,
  TrailAllFilteredMaxLongitude: 180,
  TrailAllAfterSearch: false,

  fetchTrailAllFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                               pca, account) => {
      set({ TrailAllFilteredSelectedCountries: [...selectedCountries] });
      set({ TrailAllFilteredMinLatitude: minLatitude });
      set({ TrailAllFilteredMaxLatitude: maxLatitude });
      set({ TrailAllFilteredMinLongitude: minLongitude });
      set({ TrailAllFilteredMaxLongitude: maxLongitude });
      await fetchTrailAllFilteredExecute(set, get, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude);
  },

  refreshTrailAllFiltered: async (pca, account) => {
    console.info('get.TrailAllFiltered: ', get().TrailAllFiltered);
    if(get().TrailAllFiltered.length > 0) {
      await fetchTrailAllFilteredExecute(set, get, get().TrailAllFilteredSelectedCountries, get().TrailAllFilteredMinLatitude,
        get().TrailAllFilteredMaxLatitude, get().TrailAllFilteredMinLongitude, get().TrailAllFilteredMaxLongitude);
    }
  },

})

const fetchTrailAllFilteredExecute = async (set, get, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {

  const countryIds = selectedCountries.map((country) => country.id);

  const url = new URL('http://localhost');
  const queryParams1 = { countryIds };
  const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
  queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
  Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, geoRefFloatToIntStr(value)));
  const urlRelative = `tc-api/Trail/list/all/filtered${url.search}`;
  console.info('urlRelative: ', urlRelative);

  fetch(urlRelative)
    .then(response => {
      if (response.status){
        set({TrailAllAfterSearch: true});
        return response.json();
      }
      else
        console.log(response.status);
    })
    .then(data => {
      console.info('incoming data: ', data);
      set({TrailAllFiltered: flattenData(data,  get().CountryNamesMap, get().pathTypes, get().pathLevels)});
    })
    .catch(error => {
      console.log(error);
    });
}
