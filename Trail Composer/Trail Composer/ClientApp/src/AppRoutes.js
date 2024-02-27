import { FetchPOI } from "./components/FetchPOI";

import POIForm from "./pages/POIForm/POIForm"
import HomePage from "./pages/HomePage/HomePage"
import PoiDetails from "./pages/POIDetails/POIDetails";
import NotFoundPage from "./pages/errorPages/NotFoundPage/NotFoundPage";

const AppRoutes = [
  {
    index: true,
    element: <HomePage />
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
    path: '/error/page-not-found',
    element: <NotFoundPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default AppRoutes;
