import { FetchPOI } from "./components/FetchPOI";

import AddPOI from "./pages/AddPOI/AddPOI"

const AppRoutes = [
  {
    index: true,
    element: <AddPOI />
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
