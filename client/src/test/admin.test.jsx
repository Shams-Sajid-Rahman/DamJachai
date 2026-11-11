import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import axios from 'axios';
import i18n from '../i18n/index.js';
import { mockApi, renderRoute } from './renderApp.jsx';
import { adminDashboard } from './fixtures.js';

/** Pretends the browser has a session for a user with the given role. */
function loginAs(role) {
  localStorage.setItem('damjachai_has_session', '1');
  vi.spyOn(axios, 'post').mockResolvedValue({
    data: { accessToken: 'test-token', user: { id: 1, name: role === 'admin' ? 'Site Admin' : 'Normal User', email: 'x@example.com', role, isActive: true } },
  });
}

describe('admin access', () => {
  beforeEach(async () => {
    localStorage.clear();
    mockApi({ 'get /admin/dashboard': { data: adminDashboard } });
    await i18n.changeLanguage('en');
  });

  it('shows the admin dashboard to an admin', async () => {
    loginAs('admin');
    renderRoute('/admin');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Pending price reports')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toBeInTheDocument();
  });

  it('sends a normal user away from /admin', async () => {
    loginAs('user');
    renderRoute('/admin/labs');
    // the public home page is shown instead of the admin panel
    expect(await screen.findByRole('heading', { level: 1, name: /Same test/ })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Admin navigation' })).not.toBeInTheDocument();
  });
});
