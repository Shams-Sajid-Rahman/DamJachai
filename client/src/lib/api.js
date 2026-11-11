import axios from 'axios';

// Shared Axios instance. The base URL comes from VITE_API_URL.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // needed later for the httpOnly refresh-token cookie
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
