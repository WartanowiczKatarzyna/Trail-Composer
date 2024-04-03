import HomePage from "./pages/HomePage/HomePage"
import NotFoundPage from "./pages/errorPages/NotFoundPage/NotFoundPage";
import POIForm from "./pages/PoiPages/POIForm/POIForm"
import PoiDetails from "./pages/PoiPages/POIDetails/POIDetails";
import UserPoiListPage from "./pages/PoiPages/UserPoiListPage/UserPoiListPage";
import SegmentForm from "./pages/SegmentPages/SegmentForm/SegmentForm";
import SegmentPoiListPage from "./pages/PoiPages/SegmentPoiListPage/SegmentPoiListPage";
import TrailPoiListPage from "./pages/PoiPages/TrailPoiListPage/TrailPoiListPage";

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
    path: '/list-poi/segment/:segmentId',
    element: <SegmentPoiListPage />
  },
  {
    path: '/list-poi/trail/:trailId',
    element: <TrailPoiListPage />
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
