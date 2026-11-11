import { Suspense } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { PageLoader } from './PageLoader.jsx';

/**
 * Public layout: navbar, page content and footer.
 * A route can set `handle: { darkNav: true }` (the landing page) or `handle: { bare: true }` (the admin panel has its own shell).
 */
export function RootLayout() {
  const matches = useMatches();
  const location = useLocation();
  const handle = Object.assign({}, ...matches.map((m) => m.handle || {}));

  if (handle.bare) {
    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
        <ScrollRestoration />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar dark={!!handle.darkNav} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense key={location.pathname} fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
