import {geoRefIntToFloat} from "../../../utils/geoRef";

export function flattenData(freshData, appData){
  console.log('Received POIs in flattenData:', freshData);
  return freshData.map(row => {
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      longitude: geoRefIntToFloat(row.longitude),
      latitude: geoRefIntToFloat(row.latitude),
      countryId: row.countryId,
      subRows: row.subRows,
      country: appData?.CountryNamesMap?.get(row.countryId) || 'nieznany',
      poiTypeIds: row.poiTypeIds,
      poiTypes: row.poiTypeIds.map(poiTypeId => appData?.PoiTypesMap?.get(poiTypeId) || 'nieznany').join(', ')
    };
  });
};
