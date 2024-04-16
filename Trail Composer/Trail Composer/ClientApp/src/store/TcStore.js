import { create } from 'zustand'
import { createPoiUserFilteredSlice } from './PoiUserFilteredSlice'
import { createPoiOtherFilteredSlice } from './PoiOtherFilteredSlice'
import { createSegmentSlice } from './SegmentSlice'
import { createTrailSlice } from './TrailSlice'
import { createPathLevelSlice } from './PathLevelSlice'
import { createPathTypeSlice } from './PathTypeSlice'
import { createSpinnerSlice } from "./SpinnerSlice";

export const useTcStore = create((...a) => ({
  ...createPoiUserFilteredSlice(...a),
  ...createPoiOtherFilteredSlice(...a),
  ...createPathLevelSlice(...a),
  ...createPathTypeSlice(...a),
  ...createSegmentSlice(...a),
  ...createTrailSlice(...a),
  ...createSpinnerSlice(...a),
}))
window.store = useTcStore; // !!! only for debugging, remove before going to prod mode, to get state in devtools console use: window.store.getState()
