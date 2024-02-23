import { FetchPOI } from "./components/FetchPOI";

import POIForm from "./pages/POIForm/POIForm"
import HomePage from "./pages/HomePage/HomePage"

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
  }
];

export default AppRoutes;
