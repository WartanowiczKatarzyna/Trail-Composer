import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/PoiTable/flattenData";

export const createPoiOtherFilteredSlice = (set) => ({
  poiOtherFiltered: [],
  poiOtherFilteredSelectedCountries: [],
  poiOtherFilteredMinLatitude: -90, 
  poiOtherFilteredMaxLatitude: 90, 
  poiOtherFilteredMinLongitude: -180, 
  poiOtherFilteredMaxLongitude: 180,
  poiOtherAfterSearch: false,
  
  savePoiOtherGeoSearchOptions: (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    set({ poiOtherFilteredSelectedCountries: [...selectedCountries] });
    set({ poiOtherFilteredMinLatitude: minLatitude });
    set({ poiOtherFilteredMaxLatitude: maxLatitude });
    set({ poiOtherFilteredMinLongitude: minLongitude });
    set({ poiOtherFilteredMaxLongitude: maxLongitude });
  },
  
  fetchPoiOtherFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, 
    pca, account, appData) => {
      set({ poiOtherFilteredSelectedCountries: [...selectedCountries] });
      set({ poiOtherFilteredMinLatitude: minLatitude });
      set({ poiOtherFilteredMaxLatitude: maxLatitude });
      set({ poiOtherFilteredMinLongitude: minLongitude });
      set({ poiOtherFilteredMaxLongitude: maxLongitude });

      const countryIds = selectedCountries.map((country) => country.id);
      const authHeader = await getAuthHeader(pca, account);

      const url = new URL('http://localhost');
      const queryParams1 = { countryIds };
      const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
      queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
      Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, value));
      const urlRelative = `tc-api/poi/list/filtered${url.search}`;
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
          set({poiOtherAfterSearch: true});
          return response.json();
        }
        else
          console.log(response.status);
      })
      .then(data => {
        console.info('incoming data: ', data);
        set({poiOtherFiltered: flattenData(data, appData)});
      })
      .catch(error => {
        console.log(error);
      });
    },
})
