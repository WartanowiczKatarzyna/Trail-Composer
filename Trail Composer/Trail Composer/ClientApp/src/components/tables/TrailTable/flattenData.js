export function flattenData(freshData, CountryNamesMap, pathTypes, pathLevels){
  return freshData?.map(row => {
    let distanceStrKm = '';
    if(row?.totalLength > 0.1) {
      const distanceNumKm = Number.parseFloat(row.totalLength)/1000.0;
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
      totalLength: distanceStrKm,
      countryIds: row.countryIds,
      countries: row.countryIds.map( id => CountryNamesMap.get(id)).join(', ') || 'nieznany',
      pathTypeIds: row.pathTypeIds,
      pathTypes: row.pathTypeIds?.map(pathTypeId => pathTypes.find(pathType => pathType.id == pathTypeId)?.name || 'nieznany').join(', '),
      subRows: row.subRows,
      levelId: row.levelId,
      level: pathLevels?.find(pathLevel => pathLevel.id == row.levelId)?.name || 'nieznany',
    };
  });
};
