import { WithId } from "../LocalTable/WithId";

export interface SegmentRowData extends WithId {
  id: number
  name: string
  username: string
  pathLength: number
  countryId: number
  country?: string
  segmentTypeIds: number[]
  segmentTypes?: string
  subRows?: RowData[]
  levelId: number
  level?: string
}
