import { create } from 'zustand'
import { createPoiUserFilteredSlice } from './PoiUserFilteredSlice';
import { createSegmentUserFilteredSlice } from './SegmentUserFilteredSlice';
import { createPoiOtherFilteredSlice } from './PoiOtherFilteredSlice';
import { createSegmentOtherFilteredSlice } from './SegmentOtherFilteredSlice';
import { createSegmentSlice } from './SegmentSlice';
import { createTrailSlice } from './TrailSlice';
import { createPathLevelSlice } from './PathLevelSlice';
import { createPathTypeSlice } from './PathTypeSlice';
import { createSpinnerSlice } from "./SpinnerSlice";
import { createInitDictionariesSlice } from './InitDictionariesSlice';
import { createCountrySlice } from './CountrySlice';
import { createPOITypeSlice } from "./POITypeSlice";

export const useTcStore = create((...a) => ({
  ...createPoiUserFilteredSlice(...a),
  ...createSegmentUserFilteredSlice(...a),
  ...createPoiOtherFilteredSlice(...a),
  ...createSegmentOtherFilteredSlice(...a),
  ...createPathLevelSlice(...a),
  ...createPathTypeSlice(...a),
  ...createSegmentSlice(...a),
  ...createTrailSlice(...a),
  ...createSpinnerSlice(...a),
  ...createInitDictionariesSlice(...a),
  ...createCountrySlice(...a),
  ...createPOITypeSlice(...a),
}))
window.store = useTcStore; // !!! only for debugging, remove before going to prod mode, to get state in devtools console use: window.store.getState()
