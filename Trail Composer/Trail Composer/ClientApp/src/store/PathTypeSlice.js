export const createPathTypeSlice = (set) => ({
  pathTypes: [],

  fetchPathTypes: () => {
    fetch("tc-api/path-type").then(response => response.json()).then(data => {
      const pathTypeTmp = [...data];
      const ic = new Intl.Collator('pl');
      pathTypeTmp.sort((ptA, ptB) => ic.compare(ptA.name, ptB.name));
      set({pathTypes: pathTypeTmp})
    });
  },
})
