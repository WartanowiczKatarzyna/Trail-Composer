import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/PoiTable/flattenData";

export const createPoiUserFilteredSlice = (set, get) => ({
  poiUserFiltered: [],
  poiUserFilteredSelectedCountries: [],
  poiUserFilteredMinLatitude: -90, 
  poiUserFilteredMaxLatitude: 90, 
  poiUserFilteredMinLongitude: -180, 
  poiUserFilteredMaxLongitude: 180,
  poiUserAfterSearch: false,

  fetchPoiUserFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                               pca, account, appData) => {
      set({ poiUserFilteredSelectedCountries: [...selectedCountries] });
      set({ poiUserFilteredMinLatitude: minLatitude });
      set({ poiUserFilteredMaxLatitude: maxLatitude });
      set({ poiUserFilteredMinLongitude: minLongitude });
      set({ poiUserFilteredMaxLongitude: maxLongitude });
      await fetchPoiUserFilteredExecute(set, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
        pca, account, appData);
  },

  refreshPoiUserFiltered: async (pca, account, appData) => {
    console.info('get.poiUserFiltered: ', get().poiUserFiltered);
    if(get().poiUserFiltered.length > 0) {
      await fetchPoiUserFilteredExecute(set, get().poiUserFilteredSelectedCountries, get().poiUserFilteredMinLatitude,
        get().poiUserFilteredMaxLatitude, get().poiUserFilteredMinLongitude, get().poiUserFilteredMaxLongitude,
        pca, account, appData);
    }
  },

})

const fetchPoiUserFilteredExecute = async (set, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                                           pca, account, appData) => {

  const countryIds = selectedCountries.map((country) => country.id);
  const authHeader = await getAuthHeader(pca, account);

  const url = new URL('http://localhost');
  const queryParams1 = { countryIds };
  const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
  queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
  Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, value));
  const urlRelative = `tc-api/poi/list/user/filtered${url.search}`;
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
        set({poiUserAfterSearch: true});
        return response.json();
      }
      else
        console.log(response.status);
    })
    .then(data => {
      console.info('incoming data: ', data);
      set({poiUserFiltered: flattenData(data, appData)});
    })
    .catch(error => {
      console.log(error);
    });
}
