import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import AdminHome from '../pages/admin/AdminHome.jsx';
import { GuestOnly, RequireAdmin } from './guards.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <GuestOnly><LoginPage /></GuestOnly> },
  { path: '/register', element: <GuestOnly><RegisterPage /></GuestOnly> },
  { path: '/admin/*', element: <RequireAdmin><AdminHome /></RequireAdmin> },
  { path: '*', element: <NotFoundPage /> },
]);
