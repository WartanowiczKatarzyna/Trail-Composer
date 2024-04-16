export const createSpinnerSlice = (set) => ({
  spinner: false,
  toggleSpinner: () => set((state) => ({spinner: !state.spinner})),
})
