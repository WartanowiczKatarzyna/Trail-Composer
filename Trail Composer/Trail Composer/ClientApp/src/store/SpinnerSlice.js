export const createSpinnerSlice = (set) => ({
  spinner: false,
  toggleSpinner: () => set((state) => {
    console.info('spinner: ', !state.spinner ? 'ON' : 'OFF');
    //console.trace();
    return {spinner: !state.spinner}
  }),
  spinnerON: () => set((state) => {
    console.info('spinner: ON');
    return {spinner: true}
  }),
  spinnerOFF: () => set((state) => {
    console.info('spinner: OFF');
    return {spinner: false}
  }),
})
