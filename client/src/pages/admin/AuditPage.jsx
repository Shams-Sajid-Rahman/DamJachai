import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { adminApi } from '../../lib/adminApi.js';
import { formatDate, formatNumber } from '../../lib/format.js';
import { Table } from '../../components/ui/Table.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';

const ACTION_BADGE = { create: 'teal', update: 'navy', delete: 'red', hide: 'amber', approve: 'green', reject: 'red', import: 'teal', verify: 'green', deactivate: 'red' };

export default function AuditPage() {
  const { t, lang } = useLang();
  const [filters, setFilters] = useState({ entity: '', action: '', adminId: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const set = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };

  const facets = useQuery({ queryKey: ['admin', 'audit-facets'], queryFn: adminApi.auditFacets });
  const params = { ...filters, page, limit: 25 };
  const { data, isPending, isFetching } = useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminApi.list('audit-logs', params),
    placeholderData: keepPreviousData,
  });
  const time = (v) => formatDate(v, lang, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <AdminPageHeader title={t('admin.nav.audit')} description={t('admin.audit.description')} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end">
        <Select label={t('admin.audit.entity')} value={filters.entity} onChange={(e) => set('entity', e.target.value)} placeholder={t('common.all')} options={(facets.data?.entities ?? []).map((v) => ({ value: v, label: v }))} />
        <Select label={t('admin.audit.action')} value={filters.action} onChange={(e) => set('action', e.target.value)} placeholder={t('common.all')} options={(facets.data?.actions ?? []).map((v) => ({ value: v, label: v }))} />
        <Select label={t('admin.audit.admin')} value={filters.adminId} onChange={(e) => set('adminId', e.target.value)} placeholder={t('common.all')} options={(facets.data?.admins ?? []).map((a) => ({ value: String(a.id), label: a.name }))} />
        <Input label={t('admin.audit.from')} type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
        <Input label={t('admin.audit.to')} type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
        <Button variant="link" onClick={() => { setFilters({ entity: '', action: '', adminId: '', from: '', to: '' }); setPage(1); }} className="mb-3">{t('filters.clear')}</Button>
      </div>
      <Table
        caption={t('admin.nav.audit')}
        loading={isPending}
        rows={data?.data ?? []}
        className={isFetching && !isPending ? 'opacity-70' : ''}
        columns={[
          { key: 'createdAt', header: t('admin.audit.when'), className: 'whitespace-nowrap', render: (r) => time(r.createdAt) },
          { key: 'admin', header: t('admin.audit.admin'), render: (r) => r.admin?.name ?? '—' },
          { key: 'action', header: t('admin.audit.action'), render: (r) => <Badge variant={ACTION_BADGE[r.action] || 'slate'}>{r.action}</Badge> },
          { key: 'entity', header: t('admin.audit.entity'), render: (r) => <code className="text-xs">{r.entity}{r.entityId ? ` #${r.entityId}` : ''}</code> },
          {
            key: 'details', header: t('admin.audit.details'),
            render: (r) => (
              <details className="max-w-md">
                <summary className="cursor-pointer truncate text-xs text-slate-500">{summarize(r.details)}</summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(r.details, null, 2)}</pre>
              </details>
            ),
          },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{data ? t('admin.crud.total', { n: formatNumber(data.meta.total, lang) }) : ''}</p>
        <Pagination page={page} totalPages={data?.meta.totalPages} onChange={setPage} />
      </div>
    </div>
  );
}

/** A one-line summary of the details JSON. */
function summarize(details) {
  if (!details || typeof details !== 'object') return '';
  const name = details.name || details.nameEn || details.lab || details.email || details.fileName;
  const keys = Object.keys(details.changes || {});
  return [name, keys.length ? `changed: ${keys.join(', ')}` : null].filter(Boolean).join(' · ') || JSON.stringify(details).slice(0, 80);
}
