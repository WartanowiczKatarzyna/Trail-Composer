export const createPoiOtherFilteredSlice = (set) => ({
  poiOtherFiltered: [],
  poiOtherFilteredSelectedCountries: [],
  poiOtherFilteredMinLatitude: -90, 
  poiOtherFilteredMaxLatitude: 90, 
  poiOtherFilteredMinLongitude: -180, 
  poiOtherFilteredMaxLongitude: 180,
  
  savePoiOtherGeoSearchOptions: (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    set({ poiOtherFilteredSelectedCountries: [...selectedCountries] });
    set({ poiOtherFilteredMinLatitude: minLatitude });
    set({ poiOtherFilteredMaxLatitude: maxLatitude });
    set({ poiOtherFilteredMinLongitude: minLongitude });
    set({ poiOtherFilteredMaxLongitude: maxLongitude });
  },
  
  fetchPoiOtherFiltered: (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
      set((state) => ({pois: state.pois + 1}))
    },
})