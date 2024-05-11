export function flattenData(freshData, CountryNamesMap, pathTypes, pathLevels){
  return freshData?.map(row => {
    let distanceStrKm = '';
    if(row?.length > 0.1) {
      const distanceNumKm = Number.parseFloat(row.length)/1000;
      if(distanceNumKm < 10) {
        distanceStrKm = distanceNumKm.toFixed(1).toString();
      } else {
        distanceStrKm = Math.round(distanceNumKm).toString();
      }
    }
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      length: distanceStrKm,
      countryId: row.countryId,
      country: CountryNamesMap?.get(row.countryId) || 'nieznany',
      pathTypeIds: row.pathTypeIds,
      pathTypes: row.pathTypeIds?.map(pathTypeId => pathTypes.find(pathType => pathType.id == pathTypeId)?.name || 'nieznany').join(', '),
      subRows: row.subRows,
      levelId: row.levelId,
      level: pathLevels?.find(pathLevel => pathLevel.id == row.levelId)?.name || 'nieznany',
    };
  });
};
