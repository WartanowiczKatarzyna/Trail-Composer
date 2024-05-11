import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/SegmentTable/flattenData";

export const createSegmentOtherFilteredSlice = (set, get) => ({
  SegmentOtherFiltered: [],
  SegmentOtherFilteredSelectedCountries: [],
  SegmentOtherFilteredMinLatitude: -90,
  SegmentOtherFilteredMaxLatitude: 90,
  SegmentOtherFilteredMinLongitude: -180,
  SegmentOtherFilteredMaxLongitude: 180,
  SegmentOtherAfterSearch: false,
  
  saveSegmentOtherGeoSearchOptions: (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    set({ SegmentOtherFilteredSelectedCountries: [...selectedCountries] });
    set({ SegmentOtherFilteredMinLatitude: minLatitude });
    set({ SegmentOtherFilteredMaxLatitude: maxLatitude });
    set({ SegmentOtherFilteredMinLongitude: minLongitude });
    set({ SegmentOtherFilteredMaxLongitude: maxLongitude });
  },
  
  fetchSegmentOtherFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
    pca, account) => {
      set({ SegmentOtherFilteredSelectedCountries: [...selectedCountries] });
      set({ SegmentOtherFilteredMinLatitude: minLatitude });
      set({ SegmentOtherFilteredMaxLatitude: maxLatitude });
      set({ SegmentOtherFilteredMinLongitude: minLongitude });
      set({ SegmentOtherFilteredMaxLongitude: maxLongitude });

      const countryIds = selectedCountries.map((country) => country.id);
      const authHeader = await getAuthHeader(pca, account);

      const url = new URL('http://localhost');
      const queryParams1 = { countryIds };
      const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
      queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
      Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, value));
      const urlRelative = `tc-api/Segment/list/filtered${url.search}`;
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
          set({SegmentOtherAfterSearch: true});
          return response.json();
        }
        else
          console.log(response.status);
      })
      .then(data => {
        console.info('incoming data: ', data);
        set({SegmentOtherFiltered: flattenData(data, get().CountryNamesMap, get().pathTypes, get().pathLevels)});
      })
      .catch(error => {
        console.log(error);
      });
    },
})
