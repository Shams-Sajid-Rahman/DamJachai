import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/ui/Loader.jsx';

function FullPageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  );
}

/** Only logged-in users. Others are sent to /login and come back here afterwards. */
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children ?? <Outlet />;
}

/** Only admins. A logged-in normal user is sent to the home page. */
export function RequireAdmin({ children }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/" replace state={{ forbidden: true }} />;
  return children ?? <Outlet />;
}

/** Login and register pages: a logged-in user is sent back to where they came from. */
export function GuestOnly({ children }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'authenticated') {
    // Admins land on the admin panel unless they were heading somewhere specific.
    return <Navigate to={location.state?.from?.pathname || (isAdmin ? '/admin' : '/')} replace />;
  }
  return children ?? <Outlet />;
}
