export const createPathLevelSlice = (set) => ({
  pathLevels: [],

  fetchPathLevels: () => {
    fetch("tc-api/path-levels").then(response => response.json()).then(data => {
      const pathLevelsTmp = [...data];
      pathLevelsTmp.sort((plA, plB) => (plA.name > plB.name) ? -1 : 1);
      set({pathLevels: pathLevelsTmp })
    });
  },
})
