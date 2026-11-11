import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { AuthProvider } from '../context/AuthContext.jsx';
import { BasketProvider } from '../context/BasketContext.jsx';
import { ToastProvider } from '../components/ui/Toast.jsx';

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BasketProvider>
          <ToastProvider>{children}</ToastProvider>
        </BasketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
