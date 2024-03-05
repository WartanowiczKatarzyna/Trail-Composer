import { createContext, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import PageLayout from './structure/PageLayout/PageLayout';
import './App.css';

export const AppContext = createContext(null);

const App = () => {
  const [appData, setAppData] = useState(null);

  useEffect(() => {
    // Fetch or set initial data when the component mounts
    const initialData = 
    {
      Countries: [
          { id: 1, countryName: "Polska" },
          { id: 2, countryName: "Niemcy" },
          { id: 3, countryName: "Wiekla Brytania" },
        ],
      POITypes: [
        { id: 1, name: "apteka" },
        { id: 2, name: "restauracja" },
        { id: 3, name: "schronisko" }
      ], 
      CountryNamesMap: new Map(),
      PoiTypesMap: new Map()
    };

    //initialData.CountryNamesMap = new Map();
    initialData.Countries.forEach(country => {
      initialData.CountryNamesMap.set(country.id, country.countryName);
    });
    initialData.POITypes.forEach(poi => {
      initialData.PoiTypesMap.set(poi.id, poi.name);
    })

    setAppData(initialData);

    // Function to fetch data from tc-api/country
    /*const fetchCountries = () => fetch("tc-api/country").then(response => response.json());

    // Function to fetch data from tc-api/poi-type
    const fetchPOITypes = () => fetch("tc-api/poi-type").then(response => response.json());

    // Using Promise.all to wait for both requests to complete
    Promise.all([fetchCountries(), fetchPOITypes()])
      .then(([Countries, POITypes]) => {
        // Both promises have resolved successfully
        initialData.Countries = Countries.sort((countryA, countryB) => (countryA.countryName > countryB.countryName) ? 1 : -1);;
        initialData.POITypes = POITypes.sort((typeA, typeB) => (typeA.name > typeB.name) ? 1 : -1);

        initialData.CountryNamesMap = new Map();
        initialData.Countries.forEach(country => {
          initialData.CountryNamesMap.set(country.id, country.countryName);
        });

        setAppData(initialData);
      })
      .catch(error => {
        console.error('Error:', error);
      });*/

  }, []);

  return (
    <AppContext.Provider value={appData}>
      <PageLayout>
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, ...rest } = route;
            return <Route key={index} {...rest} element={element} />;
          })}
        </Routes>
      </PageLayout>
    </AppContext.Provider>
  );
};

export default App;