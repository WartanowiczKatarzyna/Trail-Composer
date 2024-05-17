const factor = 1000000.0;

export function geoRefFloatToIntStr(value) {
  return Math.round(value * factor).toString();
}
export function geoRefIntToFloat(value) {
  return value / factor;
}
