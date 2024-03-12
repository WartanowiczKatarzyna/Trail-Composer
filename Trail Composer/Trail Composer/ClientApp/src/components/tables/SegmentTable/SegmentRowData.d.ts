import { WithId } from "../LocalTable/WithId";

export interface SegmentRowData extends WithId {
  id: number
  name: string
  username: string
  length: number
  countryId: number
  country?: string
  segmentTypeIds: number[]
  segmentTypes?: string
  subRows?: RowData[]
  level: string
}