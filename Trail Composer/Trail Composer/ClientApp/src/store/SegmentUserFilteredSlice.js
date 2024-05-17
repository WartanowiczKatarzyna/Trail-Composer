import { getAuthHeader } from "../utils/auth/getAuthHeader";
import { flattenData } from "../components/tables/SegmentTable/flattenData";
import {geoRefFloatToIntStr} from "../utils/geoRef";

export const createSegmentUserFilteredSlice = (set, get) => ({
  SegmentUserFiltered: [],
  SegmentUserFilteredSelectedCountries: [],
  SegmentUserFilteredMinLatitude: -90,
  SegmentUserFilteredMaxLatitude: 90,
  SegmentUserFilteredMinLongitude: -180,
  SegmentUserFilteredMaxLongitude: 180,
  SegmentUserAfterSearch: false,

  fetchSegmentUserFiltered: async (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                               pca, account) => {
      set({ SegmentUserFilteredSelectedCountries: [...selectedCountries] });
      set({ SegmentUserFilteredMinLatitude: minLatitude });
      set({ SegmentUserFilteredMaxLatitude: maxLatitude });
      set({ SegmentUserFilteredMinLongitude: minLongitude });
      set({ SegmentUserFilteredMaxLongitude: maxLongitude });
      await fetchSegmentUserFilteredExecute(set, get, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
        pca, account);
  },

  refreshSegmentUserFiltered: async (pca, account) => {
    console.info('get.SegmentUserFiltered: ', get().SegmentUserFiltered);
    if(get().SegmentUserFiltered.length > 0) {
      await fetchSegmentUserFilteredExecute(set, get, get().SegmentUserFilteredSelectedCountries, get().SegmentUserFilteredMinLatitude,
        get().SegmentUserFilteredMaxLatitude, get().SegmentUserFilteredMinLongitude, get().SegmentUserFilteredMaxLongitude,
        pca, account);
    }
  },

})

const fetchSegmentUserFilteredExecute = async (set, get, selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude,
                                           pca, account) => {

  const countryIds = selectedCountries.map((country) => country.id);
  const authHeader = await getAuthHeader(pca, account);

  const url = new URL('http://localhost');
  const queryParams1 = { countryIds };
  const queryParams2 = { minLatitude, maxLatitude, minLongitude, maxLongitude };
  queryParams1.countryIds.forEach(id => url.searchParams.append('countryIds', id));
  Object.entries(queryParams2).forEach(([key, value]) => url.searchParams.append(key, geoRefFloatToIntStr(value)));
  const urlRelative = `tc-api/Segment/list/user/filtered${url.search}`;
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
        set({SegmentUserAfterSearch: true});
        return response.json();
      }
      else
        console.log(response.status);
    })
    .then(data => {
      console.info('incoming data: ', data);
      set({SegmentUserFiltered: flattenData(data,  get().CountryNamesMap, get().pathTypes, get().pathLevels)});
    })
    .catch(error => {
      console.log(error);
    });
}
