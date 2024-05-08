export const createPOITypeSlice = (set) => ({
  POITypes: [],
  POITypesMap: new Map(),

  fetchPOITypes: () => {
    fetch("tc-api/poi-type").then(response => response.json()).then(data => {
      const POITypesTmp = [...data];
      POITypesTmp.sort((typeA, typeB) => (typeA.name > typeB.name) ? 1 : -1);
      set({POITypes: POITypesTmp})
      const ptm = new Map();
      POITypesTmp.forEach(poiType => ptm.set(poiType.id, poiType.name));
      set({POITypesMap: ptm});
    });
  },
})