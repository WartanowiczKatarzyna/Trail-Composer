export const createSegmentSlice = (set) => ({
  segments: 0,
  addSegment: () => set((state) => ({segments: state.segments + 1})),
})