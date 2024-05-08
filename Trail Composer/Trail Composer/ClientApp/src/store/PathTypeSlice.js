export const createPathTypeSlice = (set) => ({
  pathTypes: [],

  fetchPathTypes: () => {
    fetch("tc-api/path-type").then(response => response.json()).then(data => {
      const pathTypeTmp = [...data];
      pathTypeTmp.sort((ptA, ptB) => (ptA.name > ptB.name) ? 1 : -1);
      set({pathTypes: pathTypeTmp})
    });
  },
})
