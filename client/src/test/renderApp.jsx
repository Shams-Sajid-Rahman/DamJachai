import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import axios from 'axios';
import '../i18n/index.js';
import { api } from '../lib/api.js';
import { AuthProvider } from '../context/AuthContext.jsx';
import { BasketProvider } from '../context/BasketContext.jsx';
import { ToastProvider } from '../components/ui/Toast.jsx';
import { routes } from '../routes/router.jsx';
import { respond } from './fixtures.js';

/** Sends all API calls to the fixtures instead of the network. */
export function mockApi(overrides = {}) {
  api.defaults.adapter = async (config) => {
    const key = `${config.method} ${config.url.split('?')[0]}`;
    const data = key in overrides ? overrides[key] : respond(config.method, config.url);
    if (data === undefined) {
      const error = new Error('Not found');
      error.response = { status: 404, data: { error: { message: 'Not found' } } };
      error.config = config;
      throw error;
    }
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
  // The session refresh uses plain axios. In tests there is no session.
  vi.spyOn(axios, 'post').mockRejectedValue(Object.assign(new Error('no session'), { response: { status: 401 } }));
}

export function renderRoute(path) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BasketProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </BasketProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}
