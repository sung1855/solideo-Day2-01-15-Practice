/**
 * 라우팅 정의
 */

import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Results from '../pages/Results'
import Itinerary from '../pages/Itinerary'

const basePath = import.meta.env.BASE_URL

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/results',
      element: <Results />,
    },
    {
      path: '/itinerary',
      element: <Itinerary />,
    },
  ],
  {
    basename: basePath,
  }
)
