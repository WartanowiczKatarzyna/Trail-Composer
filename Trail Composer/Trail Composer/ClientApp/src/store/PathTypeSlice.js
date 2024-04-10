export const createPathTypeSlice = (set) => ({
  pathTypes: [],

  fetchPathTypes: async () => {
    let mockPathTypes = [
      {"id": 1, "name": "piesza"},
      {"id": 2, "name": "rowerowa"},
      {"id": 3, "name": "kajakowa"}
    ];

    set({pathTypes: [...mockPathTypes]});
  },
})