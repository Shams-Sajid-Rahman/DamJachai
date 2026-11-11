// Small fake API responses for component tests. They follow the real API shapes.

export const city = { id: 1, slug: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' };
export const area = { id: 1, slug: 'mirpur', nameEn: 'Mirpur', nameBn: 'মিরপুর' };
export const category = { id: 1, slug: 'hematology', nameEn: 'Blood Tests', nameBn: 'রক্ত পরীক্ষা' };

export const test = {
  id: 1,
  slug: 'cbc',
  nameEn: 'Complete Blood Count (CBC)',
  nameBn: 'সিবিসি',
  description: 'Measures blood cells.',
  sampleType: 'Blood',
  preparationNote: 'No special preparation. Confirm with the lab.',
  aliases: ['CBC', 'complete blood count'],
  category,
  labCount: 2,
  minPrice: 300,
  maxPrice: 650,
  avgPrice: 475,
  lastVerifiedAt: '2026-11-01T00:00:00.000Z',
};

export const lab = (id, extra = {}) => ({
  id,
  name: `Sample Lab ${id}`,
  slug: `sample-lab-${id}`,
  address: 'Sample address',
  phone: '+880 1000-000001',
  website: 'https://example.com',
  latitude: 23.8,
  longitude: 90.36,
  openingHours: 'Every day 8 AM - 10 PM',
  isAccredited: id === 1,
  accreditationNote: null,
  homeCollection: true,
  homeCollectionFee: 200,
  isSample: true,
  city,
  area,
  rating: { average: 4.5, count: 2 },
  ...extra,
});

export const compare = {
  test,
  filters: { sort: 'price_asc' },
  stats: { count: 2, minPrice: 300, maxPrice: 650, avgPrice: 475, saving: 350, cheapestLabId: 2 },
  results: [
    { labTestId: 11, price: 350, discountedPrice: 300, effectivePrice: 300, reportHours: 6, lastVerifiedAt: '2026-11-01T00:00:00.000Z', source: 'admin', isCheapest: true, savingVsMax: 350, lab: lab(2) },
    { labTestId: 12, price: 650, discountedPrice: null, effectivePrice: 650, reportHours: 4, lastVerifiedAt: '2026-01-01T00:00:00.000Z', source: 'admin', isCheapest: false, savingVsMax: 0, lab: lab(1) },
  ],
};

export const stats = { labs: 12, tests: 40, cities: 2, prices: 388, verifiedPrices: 307, reviews: 26, lastVerifiedAt: '2026-11-10T00:00:00.000Z' };

export const page = (data) => ({ data, meta: { page: 1, limit: 20, total: data.length, totalPages: 1 } });

/** Returns a response body for a request, or undefined for a 404. */
export function respond(method, url) {
  const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '').split('?')[0];
  if (method === 'post' && path === '/basket/compare') {
    return { tests: [test], complete: [{ lab: lab(1), matched: 1, total: 650, totalBeforeDiscount: 650, items: [], missingTestIds: [] }], partial: [], stats: { labsWithAll: 1, cheapestTotal: 650, highestTotal: 650, saving: 0 } };
  }
  if (path === '/tests/popular') return { data: [test] };
  if (path === '/tests') return page([test]);
  if (/^\/tests\/[^/]+\/compare$/.test(path)) return compare;
  if (/^\/tests\/[^/]+\/price-history$/.test(path)) {
    return { test, points: [{ id: 1, oldPrice: null, newPrice: 320, changedAt: '2026-01-01T00:00:00.000Z', lab: { id: 2, name: 'Sample Lab 2', slug: 'sample-lab-2' } }] };
  }
  if (/^\/tests\/[^/]+$/.test(path)) return { data: test };
  if (path === '/labs') return page([{ ...lab(1), testCount: 30 }]);
  if (/^\/labs\/[^/]+$/.test(path)) {
    return { data: { ...lab(1), onTimePercent: 90, isFavorite: false, tests: [{ ...test, labTestId: 12, price: 650, discountedPrice: null, effectivePrice: 650, reportHours: 4, lastVerifiedAt: '2026-11-01T00:00:00.000Z' }], reviews: [{ id: 1, rating: 5, reportOnTime: true, comment: '[Sample] Great', createdAt: '2026-10-01T00:00:00.000Z', userName: 'Sample' }] } };
  }
  if (path === '/cities') return { data: [{ ...city, labCount: 2, areas: [area] }] };
  if (path === '/categories') return { data: [{ ...category, testCount: 1 }] };
  if (path === '/stats') return { data: stats };
  if (path === '/health') return { status: 'ok', database: 'ok' };
  return undefined;
}
