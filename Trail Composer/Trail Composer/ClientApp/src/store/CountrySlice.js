export const createCountrySlice = (set) => ({
  Countries: [],
  CountryNamesMap: new Map(),

  fetchCountries: () => {
    fetch("tc-api/country").then(response => response.json()).then(data => {
      const CountriesTmp = [...data];
      const ic = new Intl.Collator('pl');
      CountriesTmp.sort((countryA, countryB) => ic.compare(countryA.countryName, countryB.countryName));
      set({Countries: CountriesTmp})
      const cnm = new Map();
      CountriesTmp.forEach(country => cnm.set(country.id, country.countryName));
      set({CountryNamesMap: cnm});
    });
  },
})
