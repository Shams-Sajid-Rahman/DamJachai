import { api } from './api.js';

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

const data = (p) => p.then((r) => r.data);

/** Admin API. Every call goes through the shared axios instance (Bearer token + refresh on 401). */
export const adminApi = {
  list: (resource, params) => data(api.get(`/admin/${resource}`, { params: clean(params) })),
  get: (resource, id) => data(api.get(`/admin/${resource}/${id}`)).then((r) => r.data),
  create: (resource, body) => data(api.post(`/admin/${resource}`, body)).then((r) => r.data),
  update: (resource, id, body) => data(api.patch(`/admin/${resource}/${id}`, body)).then((r) => r.data),
  remove: (resource, id) => data(api.delete(`/admin/${resource}/${id}`)).then((r) => r.data),

  dashboard: () => data(api.get('/admin/dashboard')).then((r) => r.data),
  options: () => data(api.get('/admin/options')).then((r) => r.data),
  verifyPrice: (id) => data(api.post(`/admin/lab-tests/${id}/verify`)).then((r) => r.data),

  importPrices: (file, confirm) => {
    const form = new FormData();
    form.append('file', file);
    if (confirm) form.append('confirm', 'true');
    return data(api.post('/admin/lab-tests/import', form, { timeout: 60000 })).then((r) => r.data);
  },
  importTemplate: () => api.get('/admin/lab-tests/import/template', { responseType: 'blob' }).then((r) => r.data),

  setRole: (id, role) => data(api.patch(`/admin/users/${id}/role`, { role })).then((r) => r.data),
  setActive: (id, isActive) => data(api.patch(`/admin/users/${id}/status`, { isActive })).then((r) => r.data),

  moderate: (kind, id, action, body = {}) => data(api.post(`/admin/${kind}/${id}/${action}`, body)).then((r) => r.data),

  auditFacets: () => data(api.get('/admin/audit-logs/facets')).then((r) => r.data),
};
