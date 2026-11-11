import { api } from './api.js';

// Drops empty values so URLs stay clean: { q: '', page: 1 } -> { page: 1 }
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false));

const get = async (url, params) => (await api.get(url, { params: clean(params) })).data;

export const publicApi = {
  searchTests: (params) => get('/tests', params),
  popularTests: (limit = 8) => get('/tests/popular', { limit }),
  getTest: (slug) => get(`/tests/${slug}`).then((r) => r.data),
  compareTest: (slug, filters) => get(`/tests/${slug}/compare`, filters),
  priceHistory: (slug, labId) => get(`/tests/${slug}/price-history`, { labId }),
  compareBasket: async (body) => (await api.post('/basket/compare', body)).data,
  listLabs: (params) => get('/labs', params),
  getLab: (slug) => get(`/labs/${slug}`).then((r) => r.data),
  cities: () => get('/cities').then((r) => r.data),
  categories: () => get('/categories').then((r) => r.data),
  stats: () => get('/stats').then((r) => r.data),

  // Logged-in user
  createPriceReport: async (body) => (await api.post('/price-reports', body)).data.data,
  myPriceReports: () => get('/price-reports/mine').then((r) => r.data),
  submitReview: async (body) => (await api.post('/reviews', body)).data.data,
  myReview: (labId) => get(`/reviews/mine/${labId}`).then((r) => r.data),
  favorites: () => get('/favorites').then((r) => r.data),
  addFavorite: async (labId) => (await api.post('/favorites', { labId })).data,
  removeFavorite: async (labId) => api.delete(`/favorites/${labId}`),
};
