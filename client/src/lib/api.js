import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Shared Axios instance. withCredentials sends the httpOnly refresh-token cookie.
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
});

// The access token is kept in memory only (never in localStorage), which limits the damage of an XSS bug.
// After a page reload the session comes back through the refresh cookie.
let accessToken = null;
const sessionListeners = new Set();

export const tokenStore = {
  get: () => accessToken,
  set: (token) => {
    accessToken = token || null;
  },
};

/** Subscribe to session changes: (session | null) => void. Returns an unsubscribe function. */
export function onSessionChange(listener) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

function emitSession(session) {
  sessionListeners.forEach((listener) => listener(session));
}

// Single-flight refresh: concurrent 401s (and React StrictMode double effects) share one refresh call.
// This matters because the server rotates the refresh token on every call.
let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true, timeout: 15000 })
      .then(({ data }) => {
        tokenStore.set(data.accessToken);
        emitSession(data);
        return data;
      })
      .catch((err) => {
        tokenStore.set(null);
        emitSession(null);
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function setSession(session) {
  tokenStore.set(session?.accessToken);
  emitSession(session);
}

// These auth routes must never trigger an automatic refresh-and-retry.
const NO_RETRY_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const skip = !original || original._retry || NO_RETRY_PATHS.some((p) => original.url?.startsWith(p));

    if (status === 401 && !skip) {
      original._retry = true;
      try {
        await refreshSession();
        original.headers.Authorization = `Bearer ${tokenStore.get()}`;
        return api(original);
      } catch {
        // The refresh failed, so the session is over. Reject with the original 401.
      }
    }
    return Promise.reject(error);
  },
);
