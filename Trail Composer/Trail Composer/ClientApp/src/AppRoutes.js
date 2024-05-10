import HomePage from "./pages/HomePage/HomePage"
import TrailForm from "./pages/TrailPages/TrailForm/TrailForm";
import SegmentForm from "./pages/SegmentPages/SegmentForm/SegmentForm";
import SegmentDetails from "./pages/SegmentPages/SegmentDetails/SegmentDetails";
import UserSegmentListPage from "./pages/SegmentPages/UserSegmentListPage/UserSegmentListPage";
import TrailSegmentListPage from "./pages/SegmentPages/TrailSegmentListPage/TrailSegmentListPage";
import POIForm from "./pages/PoiPages/POIForm/POIForm"
import PoiDetails from "./pages/PoiPages/POIDetails/POIDetails";
import UserPoiListPage from "./pages/PoiPages/UserPoiListPage/UserPoiListPage";
import SegmentPoiListPage from "./pages/PoiPages/SegmentPoiListPage/SegmentPoiListPage";
import TrailPoiListPage from "./pages/PoiPages/TrailPoiListPage/TrailPoiListPage";
import NotFoundPage from "./pages/errorPages/NotFoundPage/NotFoundPage";

const AppRoutes = [
  {
    index: true,
    element: <HomePage />
  },
  {
    path: '/add-trail',
    element: <TrailForm editMode={false}/>
  },
  {
    path: '/edit-trail/:trail',
    element: <TrailForm editMode={true}/>
  },
  {
    path: '/add-segment',
    element: <SegmentForm editMode={false}/>
  },
  {
    path: '/edit-segment/:segmentId',
    element: <SegmentForm editMode={true}/>
  },
  {
    path: '/details-segment/:segmentId',
    element: <SegmentDetails />
  },
  {
    path: '/list-segment/user',
    element: <UserSegmentListPage />
  },
  {
    path: '/list-segment/trail/:trailId',
    element: <TrailSegmentListPage />
  },
  {
    path: '/add-POI',
    element: <POIForm editMode={false}/>
  },
  {
    path: '/edit-POI/:poiId',
    element: <POIForm editMode={true}/>
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
