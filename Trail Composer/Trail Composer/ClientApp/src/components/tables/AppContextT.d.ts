export interface AppContextT {
    Countries: CountryTList;
    POITypes: PoiTypeTList;
}

export interface CountryTList {
    [index: number]: CountryT;
}

export interface CountryT {
    id: number;
    name: string;
}

export interface PoiTypeTList {
    [index: number]: PoiTypeT;
}

export interface PoiTypeT {
    id: number;
    name: string; 
}