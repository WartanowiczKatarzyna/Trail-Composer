import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/PoiTable/flattenData";

const initialData =
{
  Countries: [
    { id: 29, countryName: "Polska" },
    { id: 30, countryName: "Niemcy" },
    { id: 28, countryName: "Wiekla Brytania" },
  ],
  POITypes: [
    { id: 1, name: "apteka" },
    { id: 2, name: "restauracja" },
    { id: 3, name: "schronisko" }
  ],
  CountryNamesMap: new Map(),
  PoiTypesMap: new Map()
};

// mapowanie zamockowanych wartości
initialData.CountryNamesMap = new Map();
initialData.Countries.forEach(country => {
  initialData.CountryNamesMap.set(country.id, country.countryName);
});
initialData.POITypes.forEach(poi => {
  initialData.PoiTypesMap.set(poi.id, poi.name);
})

export const createPoiUserFilteredSlice = (set) => ({
  poiUserFiltered: [],
  poiUserFilteredSelectedCountries: [],
  poiUserFilteredMinLatitude: -90, 
  poiUserFilteredMaxLatitude: 90, 
  poiUserFilteredMinLongitude: -180, 
  poiUserFilteredMaxLongitude: 180,

  savePoiUserGeoSearchOptions: (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    set({ poiUserFilteredSelectedCountries: [...selectedCountries] });
    set({ poiUserFilteredMinLatitude: minLatitude });
    set({ poiUserFilteredMaxLatitude: maxLatitude });
    set({ poiUserFilteredMinLongitude: minLongitude });
    set({ poiUserFilteredMaxLongitude: maxLongitude });
  },
  
  fetchPoiUserFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, 
    pca, account, appData) => {
      set({ poiUserFilteredSelectedCountries: [...selectedCountries] });
      set({ poiUserFilteredMinLatitude: minLatitude });
      set({ poiUserFilteredMaxLatitude: maxLatitude });
      set({ poiUserFilteredMinLongitude: minLongitude });
      set({ poiUserFilteredMaxLongitude: maxLongitude });

      const countryIds = selectedCountries.map((country) => country.id);
      const authHeader = await getAuthHeader(pca, account);

      const connString = 'http://localhost:44491/tc-api/poi/list/user/filtered';
      const url = new URL(connString);
      const queryParams1 = { countryIds };
      const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
      queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
      Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, value));
      
      console.info('url: ', url);
      
      fetch(url.toString(),
      {
        method: "GET",
        headers: {
          Authorization: authHeader
        }
      })
      .then(response => {
        if (response.status)
          return response.json()
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
  },

})