import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './i18n/index.js';
import './index.css';
import { AppProviders } from './providers/AppProviders.jsx';
import { router } from './routes/router.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
