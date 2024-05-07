import React, { createContext, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import PageLayout from './structure/PageLayout/PageLayout';
import { useTcStore } from './store/TcStore';
import './App.css';
import TcSpinner from "./components/TCSpinner/TCSpinner";

export const AppContext = createContext(null);

const App = () => {
  const [appData, setAppData] = useState(null);
  const Countries = useTcStore(state => state.Countries);
  const CountriesNamesMap = useTcStore(state => state.CountryNamesMap);
  const POITypes = useTcStore(state => state.POITypes);
  const POITypesMap = useTcStore(state => state.POITypesMap);
  const initDictionaries = useTcStore((state) => state.initDictionaries);
  const spinner = useTcStore((state) => state.spinner);

  useEffect(() => {
    initDictionaries();
  }, []);

  useEffect(() => {
    const initialData = {};
    initialData.Countries = Countries;
    initialData.CountryNamesMap = CountriesNamesMap;
    initialData.POITypes = POITypes;
    initialData.PoiTypesMap = POITypesMap;
    setAppData(initialData);
  }, [Countries, CountriesNamesMap, POITypes, POITypesMap]);

  return (
    <AppContext.Provider value={appData}>
      { spinner && <TcSpinner /> }
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
