import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onSessionChange, refreshSession, setSession } from '../lib/api.js';
import { loginRequest, logoutRequest, registerRequest } from '../lib/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // "loading" while the first refresh call runs, so protected pages do not redirect too early.
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onSessionChange((session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? 'authenticated' : 'guest');
    });

    // Bring the session back after a page reload through the httpOnly refresh cookie.
    refreshSession().catch(() => setStatus('guest'));

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials) => {
    const session = await loginRequest(credentials);
    setSession(session);
    return session.user;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await registerRequest(payload);
    setSession(session);
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setSession(null);
      // Drop cached user-specific data such as favorites.
      queryClient.removeQueries({ predicate: (q) => q.meta?.private === true });
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
