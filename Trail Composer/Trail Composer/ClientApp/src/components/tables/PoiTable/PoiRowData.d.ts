import { WithId } from "../LocalTable/WithId";

export interface PoiRowData extends WithId {
  id: number
  name: string
  username: string
  longitude: number
  latitude: number
  // description: string
  countryId: number
  country?: string
  poiTypeIds: number[]
  poiTypes?: string
  subRows?: RowData[]
}