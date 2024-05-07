export const createInitDictionariesSlice = (set, get) => ({
  pathLevels: [],

  initDictionaries: () => {
    get().fetchPathLevels();
    get().fetchPathTypes();
    get().fetchCountries();
    get().fetchPOITypes();
  },
})
