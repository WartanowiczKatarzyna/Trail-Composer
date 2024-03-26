import { FetchPOI } from "./components/FetchPOI";

import HomePage from "./pages/HomePage/HomePage"
import NotFoundPage from "./pages/errorPages/NotFoundPage/NotFoundPage";
import POIForm from "./pages/PoiPages/POIForm/POIForm"
import PoiDetails from "./pages/PoiPages/POIDetails/POIDetails";
import PoiListPage from "./pages/PoiPages/PoiListPage/PoiListPage";
import UserPoiListPage from "./pages/PoiPages/UserPoiListPage/UserPoiListPage";
import SegmentForm from "./pages/SegmentPages/SegmentForm/SegmentForm";

const AppRoutes = [
  {
    index: true,
    element: <HomePage />
  },
  {
    path: '/add-segment',
    element: <SegmentForm />
  },
  {
    path: '/fetch-POI',
    element: <FetchPOI />
  },
  {
    path: '/add-POI',
    element: <POIForm />
  },
  {
    path: '/edit-POI/:poiId',
    element: <POIForm />
  },
  {
    path: '/details-POI/:poiId',
    element: <PoiDetails />
  },
  {
    path: '/list-poi/user',
    element: <UserPoiListPage />
  },
  {
    path: '/error/page-not-found',
    element: <NotFoundPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default AppRoutes;
