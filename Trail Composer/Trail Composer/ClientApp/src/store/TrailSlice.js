export const createTrailSlice = (set) => ({
  trails: 0,
  addTrail: () => set((state) => ({trails: state.trails + 1})),
})