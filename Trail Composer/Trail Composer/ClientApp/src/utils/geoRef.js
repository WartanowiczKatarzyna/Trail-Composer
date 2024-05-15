export function geoRefFloatToIntStr(value) {
  return Math.round(value * 1000000).toString();
}
export function geoRefIntToFloat(value) {
  return value / 1000000;
}
