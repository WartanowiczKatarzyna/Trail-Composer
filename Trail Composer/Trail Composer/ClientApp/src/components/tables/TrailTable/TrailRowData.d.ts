import { WithId } from "../LocalTable/WithId";

export interface TrailRowData extends WithId {
  id: number
  name: string
  username: string
  length: number
  countryId: number
  country?: string
  trailTypeIds: number[]
  trailTypes?: string
  subRows?: RowData[]
  levelId: number
  level?: string
}
