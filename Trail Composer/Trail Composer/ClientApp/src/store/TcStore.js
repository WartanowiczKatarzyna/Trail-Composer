import { create } from 'zustand'
import { createPoiUserFilteredSlice } from './PoiUserFilteredSlice'
import { createPoiOtherFilteredSlice } from './PoiOtherFilteredSlice'
import { createSegmentSlice } from './SegmentSlice'
import { createTrailSlice } from './TrailSlice'

export const useTcStore = create((...a) => ({
  ...createPoiUserFilteredSlice(...a),
  ...createPoiOtherFilteredSlice(...a),
  ...createSegmentSlice(...a),
  ...createTrailSlice(...a),
}))
window.store = useTcStore; // !!! only for debugging, remove before going to prod mode, to get state in devtools console use: window.store.getState()
