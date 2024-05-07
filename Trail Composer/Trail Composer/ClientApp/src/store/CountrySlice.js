export const createCountrySlice = (set) => ({
  Countries: [],
  CountryNamesMap: new Map(),

  fetchCountries: () => {
    fetch("tc-api/country").then(response => response.json()).then(data => {
      const CountriesTmp = [...data];
      CountriesTmp.sort((countryA, countryB) => (countryA.countryName > countryB.countryName) ? 1 : -1);
      set({Countries: CountriesTmp})
      const cnm = new Map();
      CountriesTmp.forEach(country => cnm.set(country.id, country.countryName));
      set({CountryNamesMap: cnm});
    });
  },
})
