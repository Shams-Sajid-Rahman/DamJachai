import { describe, expect, it } from 'vitest';
import { daysSince, formatPrice, isStale, localName, reportTime } from '../lib/format.js';
import { pageList } from '../components/ui/Pagination.jsx';
import { niceTicks } from '../components/charts/PriceHistoryChart.jsx';

describe('formatting', () => {
  it('formats Taka in English and with Bengali digits in Bangla', () => {
    expect(formatPrice(1200, 'en')).toBe('৳1,200');
    expect(formatPrice(1200, 'bn')).toBe('৳১,২০০');
    expect(formatPrice(99.5, 'en')).toBe('৳99.50');
    expect(formatPrice(null, 'en')).toBe('');
  });

  it('marks prices older than 90 days as stale', () => {
    const now = Date.now();
    expect(isStale(new Date(now - 10 * 86_400_000))).toBe(false);
    expect(isStale(new Date(now - 120 * 86_400_000))).toBe(true);
    expect(daysSince(new Date(now - 3 * 86_400_000))).toBe(3);
  });

  it('shows report time in hours below 48 hours and in days above', () => {
    expect(reportTime(6)).toEqual({ value: 6, unit: 'hours' });
    expect(reportTime(72)).toEqual({ value: 3, unit: 'days' });
    expect(reportTime(null)).toBeNull();
  });

  it('picks the name in the current language, falling back to the other one', () => {
    expect(localName({ nameEn: 'Dhaka', nameBn: 'ঢাকা' }, 'bn')).toBe('ঢাকা');
    expect(localName({ nameEn: 'Dhaka', nameBn: '' }, 'bn')).toBe('Dhaka');
  });
});

describe('pagination and chart helpers', () => {
  it('shortens long page lists with ellipses', () => {
    expect(pageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageList(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12]);
  });

  it('builds round chart ticks around the data', () => {
    expect(niceTicks([10100, 10400])).toEqual([10000, 10200, 10400, 10600]);
    expect(niceTicks([300, 300])[0]).toBeLessThanOrEqual(300);
  });
});
