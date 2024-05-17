export const createPOITypeSlice = (set) => ({
  POITypes: [],
  POITypesMap: new Map(),

  fetchPOITypes: () => {
    fetch("tc-api/poi-type").then(response => response.json()).then(data => {
      const POITypesTmp = [...data];
      const ic = new Intl.Collator('pl');
      POITypesTmp.sort((typeA, typeB) => ic.compare(typeA.name, typeB.name));
      set({POITypes: POITypesTmp})
      const ptm = new Map();
      POITypesTmp.forEach(poiType => ptm.set(poiType.id, poiType.name));
      set({POITypesMap: ptm});
    });
  },
})
