import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout.jsx';
import ErrorPage from '../pages/ErrorPage.jsx';
import { GuestOnly, RequireAdmin, RequireAuth } from './guards.jsx';

// Every page is its own chunk, so the first load only downloads what it needs.
const HomePage = lazy(() => import('../pages/HomePage.jsx'));
const TestsPage = lazy(() => import('../pages/public/TestsPage.jsx'));
const TestComparePage = lazy(() => import('../pages/public/TestComparePage.jsx'));
const LabsPage = lazy(() => import('../pages/public/LabsPage.jsx'));
const LabPage = lazy(() => import('../pages/public/LabPage.jsx'));
const BasketPage = lazy(() => import('../pages/public/BasketPage.jsx'));
const FavoritesPage = lazy(() => import('../pages/public/FavoritesPage.jsx'));
const ReportPricePage = lazy(() => import('../pages/public/ReportPricePage.jsx'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx'));
const AdminApp = lazy(() => import('../pages/admin/AdminApp.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

export const routes = [
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage />, handle: { darkNav: true } },
      { path: 'tests', element: <TestsPage /> },
      { path: 'tests/:slug', element: <TestComparePage /> },
      { path: 'labs', element: <LabsPage /> },
      { path: 'labs/:slug', element: <LabPage /> },
      { path: 'basket', element: <BasketPage /> },
      { path: 'favorites', element: <RequireAuth><FavoritesPage /></RequireAuth> },
      { path: 'report-price', element: <RequireAuth><ReportPricePage /></RequireAuth> },
      { path: 'login', element: <GuestOnly><LoginPage /></GuestOnly> },
      { path: 'register', element: <GuestOnly><RegisterPage /></GuestOnly> },
      { path: 'admin/*', element: <RequireAdmin><AdminApp /></RequireAdmin>, handle: { bare: true } },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
