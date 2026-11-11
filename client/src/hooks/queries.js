import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '../lib/publicApi.js';
import { useAuth } from '../context/AuthContext.jsx';

// Query keys live in one place so cache invalidation stays consistent.
export const keys = {
  tests: (params) => ['tests', params],
  popular: (limit) => ['tests', 'popular', limit],
  test: (slug) => ['test', slug],
  compare: (slug, filters) => ['compare', slug, filters],
  history: (slug, labId) => ['history', slug, labId ?? 'all'],
  basket: (body) => ['basket', body],
  labs: (params) => ['labs', params],
  lab: (slug) => ['lab', slug],
  cities: ['cities'],
  categories: ['categories'],
  stats: ['stats'],
  favorites: ['favorites'],
  myReports: ['my-reports'],
  myReview: (labId) => ['my-review', labId],
};

const LOOKUP_STALE = 10 * 60 * 1000;

export const useTestSearch = (params, options = {}) =>
  useQuery({ queryKey: keys.tests(params), queryFn: () => publicApi.searchTests(params), placeholderData: keepPreviousData, ...options });

export const usePopularTests = (limit = 8) =>
  useQuery({ queryKey: keys.popular(limit), queryFn: () => publicApi.popularTests(limit), select: (r) => r.data });

export const useTest = (slug) => useQuery({ queryKey: keys.test(slug), queryFn: () => publicApi.getTest(slug), enabled: !!slug });

export const useCompare = (slug, filters) =>
  useQuery({
    queryKey: keys.compare(slug, filters),
    queryFn: () => publicApi.compareTest(slug, filters),
    enabled: !!slug,
    placeholderData: keepPreviousData,
  });

export const usePriceHistory = (slug, labId) =>
  useQuery({ queryKey: keys.history(slug, labId), queryFn: () => publicApi.priceHistory(slug, labId), enabled: !!slug });

export const useBasketCompare = (body) =>
  useQuery({
    queryKey: keys.basket(body),
    queryFn: () => publicApi.compareBasket(body),
    enabled: body.testIds.length > 0,
    placeholderData: keepPreviousData,
  });

export const useLabs = (params) =>
  useQuery({ queryKey: keys.labs(params), queryFn: () => publicApi.listLabs(params), placeholderData: keepPreviousData });

export const useLab = (slug) => {
  const { status } = useAuth();
  // Wait until the session is known, so isFavorite is correct for logged-in users.
  return useQuery({ queryKey: [...keys.lab(slug), status], queryFn: () => publicApi.getLab(slug), enabled: !!slug && status !== 'loading' });
};

export const useCities = () => useQuery({ queryKey: keys.cities, queryFn: publicApi.cities, staleTime: LOOKUP_STALE });
export const useCategories = () => useQuery({ queryKey: keys.categories, queryFn: publicApi.categories, staleTime: LOOKUP_STALE });
export const useStats = () => useQuery({ queryKey: keys.stats, queryFn: publicApi.stats });

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: keys.favorites, queryFn: publicApi.favorites, enabled: isAuthenticated, meta: { private: true } });
};

export const useMyReports = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: keys.myReports, queryFn: publicApi.myPriceReports, enabled: isAuthenticated, meta: { private: true } });
};

export const useMyReview = (labId) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: keys.myReview(labId),
    queryFn: () => publicApi.myReview(labId),
    enabled: isAuthenticated && !!labId,
    meta: { private: true },
  });
};

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ labId, isFavorite }) => (isFavorite ? publicApi.removeFavorite(labId) : publicApi.addFavorite(labId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.favorites });
      qc.invalidateQueries({ queryKey: ['lab'] });
    },
  });
}
