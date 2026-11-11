import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import i18n from '../i18n/index.js';
import { mockApi, renderRoute } from './renderApp.jsx';

// Renders every public route, to catch runtime errors early.
const ROUTES = ['/', '/tests', '/tests/cbc', '/labs', '/labs/sample-lab-1', '/basket', '/login', '/register', '/does-not-exist'];

describe('routes render without crashing', () => {
  beforeEach(async () => {
    mockApi();
    await i18n.changeLanguage('en');
  });

  for (const path of ROUTES) {
    it(`renders ${path}`, async () => {
      renderRoute(path);
      // The layout shows the navbar and footer disclaimer on every public page.
      expect(await screen.findByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      expect(await screen.findByText(/Always confirm the price with the lab/i)).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong on this page.')).not.toBeInTheDocument();
    });
  }

  it('sends guests from /favorites to the login page', async () => {
    renderRoute('/favorites');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('sends guests from /admin to the login page', async () => {
    renderRoute('/admin');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows Bangla navigation when the language is bn', async () => {
    await i18n.changeLanguage('bn');
    renderRoute('/tests');
    expect((await screen.findAllByRole('link', { name: 'পরীক্ষা' })).length).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe('bn');
  });
});
