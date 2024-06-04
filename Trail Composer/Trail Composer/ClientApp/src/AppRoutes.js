import HomePage from "./pages/HomePage/HomePage"
import TrailForm from "./pages/TrailPages/TrailForm/TrailForm";
import SegmentForm from "./pages/SegmentPages/SegmentForm/SegmentForm";
import TrailDetails from "./pages/TrailPages/TrailDetails/TrailDetails";
import SegmentDetails from "./pages/SegmentPages/SegmentDetails/SegmentDetails";
import UserSegmentListPage from "./pages/SegmentPages/UserSegmentListPage/UserSegmentListPage";
import UserTrailListPage from "./pages/TrailPages/UserTrailListPage/UserTrailListPage";
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
    element: <HomePage />,
    key: 'HomePage'
  },
  {
    path: '/details-trail/:trailId',
    element: <TrailDetails />,
    key: 'details-trail/'
  },
  {
    path: '/list-trail/user',
    element: <UserTrailListPage />,
    key: 'list-trail/user'
  },
  {
    path: '/add-trail',
    element: <TrailForm editMode={false}/>,
    key: 'add-trail'
  },
  {
    path: '/edit-trail/:trailId',
    element: <TrailForm editMode={true}/>,
    key: 'edit-trail'
  },
  {
    path: '/add-segment',
    element: <SegmentForm editMode={false}/>,
    key: 'add-segment'
  },
  {
    path: '/edit-segment/:segmentId',
    element: <SegmentForm editMode={true}/>,
    key: 'edit-segment'
  },
  {
    path: '/details-segment/:segmentId',
    element: <SegmentDetails />,
    key: 'details-segment'
  },
  {
    path: '/list-segment/user',
    element: <UserSegmentListPage />,
    key: 'list-segment/user'
  },
  {
    path: '/list-segment/trail/:trailId',
    element: <TrailSegmentListPage />,
    key: 'list-segment/trail'
  },
  {
    path: '/add-POI',
    element: <POIForm editMode={false}/>,
    key: 'add-POI'
  },
  {
    path: '/edit-POI/:poiId',
    element: <POIForm editMode={true}/>,
    key: 'edit-POI'
  },
  {
    path: '/details-POI/:poiId',
    element: <PoiDetails />,
    key: 'details-POI'
  },
  {
    path: '/list-poi/user',
    element: <UserPoiListPage />,
    key: 'list-poi/user'
  },
  {
    path: '/list-poi/segment/:segmentId',
    element: <SegmentPoiListPage />,
    key: 'list-poi/segment'
  },
  {
    path: '/list-poi/trail/:trailId',
    element: <TrailPoiListPage />,
    key: 'list-poi/trail'
  },
  {
    path: '/error/page-not-found',
    element: <NotFoundPage />,
    key: 'error/page-not-found'
  },
  {
    path: '*',
    element: <NotFoundPage />,
    key: 'NotFoundPage'
  }
];

export default AppRoutes;
