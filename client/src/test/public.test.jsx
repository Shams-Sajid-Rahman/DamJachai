import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n/index.js';
import { api } from '../lib/api.js';
import { mockApi, renderRoute } from './renderApp.jsx';

describe('public pages', () => {
  beforeEach(async () => {
    localStorage.clear();
    mockApi();
    await i18n.changeLanguage('en');
  });

  it('compare page highlights the cheapest lab and shows the saving', async () => {
    renderRoute('/tests/cbc');
    const table = await screen.findByRole('table', { name: /Labs that offer this test/ });
    const rows = within(table).getAllByRole('row').slice(1);
    // the first data row is the cheapest lab, with the coral "Save ৳350" badge
    expect(within(rows[0]).getByText('Sample Lab 2')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Save ৳350')).toBeInTheDocument();
    expect(within(rows[1]).queryByText(/Save/)).not.toBeInTheDocument();
    // the statistics bar
    expect(screen.getByText('You could save')).toBeInTheDocument();
    // a price older than 90 days is marked
    expect(within(rows[1]).getByTitle(/Last verified/).className).toMatch(/amber/);
  });

  it('compare filters are sent to the API and kept in the URL', async () => {
    const calls = [];
    const adapter = api.defaults.adapter;
    api.defaults.adapter = (config) => {
      calls.push(config);
      return adapter(config);
    };
    renderRoute('/tests/cbc?sort=rating&homeCollection=true');
    await screen.findByRole('table', { name: /Labs that offer this test/ });
    const compareCall = calls.find((c) => c.url.endsWith('/compare'));
    expect(compareCall.params).toMatchObject({ sort: 'rating', homeCollection: true });
  });

  it('basket shows the total per lab for the tests in it', async () => {
    localStorage.setItem('damjachai_basket', JSON.stringify([{ id: 1, slug: 'cbc', nameEn: 'Complete Blood Count (CBC)', nameBn: 'সিবিসি' }]));
    renderRoute('/basket');
    expect(await screen.findByText('1 lab offers all your tests')).toBeInTheDocument();
    expect(screen.getByText('Best total')).toBeInTheDocument();
    expect(screen.getAllByText('৳650').length).toBeGreaterThan(0);
  });

  it('report price page asks guests to log in', async () => {
    renderRoute('/report-price?test=cbc');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('tests page search updates the results query', async () => {
    const user = userEvent.setup();
    renderRoute('/tests');
    expect(await screen.findByText('1 result')).toBeInTheDocument();
    const input = screen.getAllByRole('combobox', { name: 'Search for a test' })[0];
    await user.type(input, 'cbc{Enter}');
    await waitFor(() => expect(screen.getByText('“cbc”')).toBeInTheDocument());
  });
});
