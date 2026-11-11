import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import i18n from '../i18n/index.js';
import { mockApi, renderRoute } from './renderApp.jsx';

describe('landing page', () => {
  beforeEach(async () => {
    mockApi();
    await i18n.changeLanguage('en');
  });

  it('shows the headline and search right away (not inside the 3D canvas)', async () => {
    renderRoute('/');
    expect(await screen.findByRole('heading', { level: 1, name: /Same test\. Different price\. Check before you pay\./ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Search for a test' })).toBeInTheDocument();
  });

  it('uses the 2D fallback when WebGL is not available (jsdom has no WebGL)', async () => {
    const { container } = renderRoute('/');
    await waitFor(() => expect(container.querySelector('[data-tier]')?.getAttribute('data-tier')).toBe('fallback'));
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('shows live data from the API: popular tests, the price gap and stats', async () => {
    renderRoute('/');
    // popular test card, with the "from" price taken from the API fixture
    expect((await screen.findAllByText('Complete Blood Count (CBC)')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('৳300').length).toBeGreaterThan(0);
    // price-gap example: cheapest vs most expensive, and the saving
    expect(await screen.findByText('৳650')).toBeInTheDocument();
    expect(screen.getAllByText('Save ৳350').length).toBeGreaterThan(0);
    // stats (count-up finishes on the final value)
    await waitFor(() => expect(screen.getAllByText('307').length).toBeGreaterThan(0), { timeout: 3000 });
  });
});
