import React from "react";

  interface CountryType {
    id: number;
    countryName: string;
  }
  interface CountryListType {
    [index: number]: CountryType;
  }

  interface PoiTypeType {
    id: number;
    name: string;
  }

  interface PoiTypeListType {
    [index: number]: PoiTypeType;
  }

  export interface AppContextValueType {
    Countries: CountryListType;
    POITypes: PoiTypeListType;
    CountryNamesMap: Map<number, string>;
    PoiTypesMap: Map<number, string>;
  }
  declare const AppContext: React.Context<AppContextValueType>;