export const createPathLevelSlice = (set) => ({
  pathLevels: [],

  fetchPathLevels: () => {
    fetch("tc-api/path-level").then(response => response.json()).then(data => {
      const pathLevelsTmp = [...data];
      const ic = new Intl.Collator('pl');
      pathLevelsTmp.sort((plA, plB) => ic.compare(plA.name, plB.name));
      set({pathLevels: pathLevelsTmp })
    });
  },
})
