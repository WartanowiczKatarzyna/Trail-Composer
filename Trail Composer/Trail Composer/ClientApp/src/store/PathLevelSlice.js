export const createPathLevelSlice = (set) => ({
  pathLevels: [],

  fetchPathLevels: async () => {
    let mockPathLevels = [
      {"id": 1, "level": "początkujący"},
      {"id": 2, "level": "średni"},
      {"id": 3, "level": "zaawansowany"}
    ];

    set({pathLevels: [...mockPathLevels]});
  },
})