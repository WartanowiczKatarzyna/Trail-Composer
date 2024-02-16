import { FetchPOI } from "./components/FetchPOI";

import AddPOI from "./pages/AddPOI/AddPOI"
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
    element: <AddPOI />
  }
];

export default AppRoutes;
