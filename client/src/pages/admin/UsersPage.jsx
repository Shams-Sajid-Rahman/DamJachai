import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../../lib/adminApi.js';
import { formatDate, formatNumber } from '../../lib/format.js';
import { getErrorMessage } from '../../lib/errors.js';
import { Table } from '../../components/ui/Table.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select, Toggle } from '../../components/ui/Select.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';

export default function UsersPage() {
  const { t, lang } = useLang();
  const { user: me } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');
  const [sort, setSort] = useState({ key: 'created', order: 'desc' });
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // { kind: 'role' | 'status', user, value }
  const debouncedQ = useDebounce(q, 300);

  const params = { q: debouncedQ, role, isActive: active, sort: sort.key, order: sort.order, page, limit: 20 };
  const { data, isPending, isFetching } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.list('users', params),
    placeholderData: keepPreviousData,
  });

  const mutation = useMutation({
    mutationFn: ({ kind, user, value }) => (kind === 'role' ? adminApi.setRole(user.id, value) : adminApi.setActive(user.id, value)),
    onSuccess: () => {
      toast.success(t('admin.users.updated'));
      setPending(null);
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, t));
      setPending(null);
    },
  });

  const onSort = (key) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));

  return (
    <div>
      <AdminPageHeader title={t('admin.nav.users')} description={t('admin.users.description')} />
      <div className="mb-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <Input aria-label={t('common.search')} type="search" placeholder={t('admin.users.search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <Select aria-label={t('admin.users.role')} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} placeholder={t('admin.users.anyRole')} options={['user', 'admin'].map((r) => ({ value: r, label: t(`admin.users.roles.${r}`) }))} />
        <Select aria-label={t('admin.fields.status')} value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} placeholder={t('admin.status.any')} options={[{ value: 'true', label: t('admin.users.active') }, { value: 'false', label: t('admin.users.inactive') }]} />
      </div>
      <Table
        caption={t('admin.nav.users')}
        loading={isPending}
        rows={data?.data ?? []}
        sort={sort}
        onSort={onSort}
        className={isFetching && !isPending ? 'opacity-70' : ''}
        columns={[
          {
            key: 'name', header: t('admin.fields.name'), sortKey: 'name',
            render: (u) => (
              <div>
                <p className="font-medium text-navy">{u.name} {u.id === me?.id && <Badge variant="teal">{t('admin.users.you')}</Badge>}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
            ),
          },
          {
            key: 'role', header: t('admin.users.role'),
            render: (u) => (
              <Select
                aria-label={t('admin.users.roleFor', { name: u.name })}
                value={u.role}
                disabled={u.id === me?.id}
                onChange={(e) => setPending({ kind: 'role', user: u, value: e.target.value })}
                options={['user', 'admin'].map((r) => ({ value: r, label: t(`admin.users.roles.${r}`) }))}
                selectClassName="h-9 w-32 text-sm"
              />
            ),
          },
          {
            key: 'active', header: t('admin.fields.status'),
            render: (u) => (
              <div className={u.id === me?.id ? 'pointer-events-none opacity-50' : ''}>
                <Toggle
                  label={u.isActive ? t('admin.users.active') : t('admin.users.inactive')}
                  checked={u.isActive}
                  onChange={(v) => setPending({ kind: 'status', user: u, value: v })}
                />
              </div>
            ),
          },
          { key: 'activity', header: t('admin.users.contributions'), render: (u) => t('admin.users.counts', { reviews: formatNumber(u.reviewCount, lang), reports: formatNumber(u.reportCount, lang) }) },
          { key: 'createdAt', header: t('admin.users.joined'), sortKey: 'created', render: (u) => formatDate(u.createdAt, lang) },
        ]}
      />
      <Pagination className="mt-4" page={page} totalPages={data?.meta.totalPages} onChange={setPage} />
      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => mutation.mutate(pending)}
        loading={mutation.isPending}
        danger={pending?.kind === 'status' ? !pending.value : pending?.value === 'admin'}
        title={t('admin.users.confirmTitle')}
        message={
          pending?.kind === 'role'
            ? t('admin.users.confirmRole', { name: pending?.user.name, role: t(`admin.users.roles.${pending?.value}`) })
            : pending?.value
              ? t('admin.users.confirmActivate', { name: pending?.user.name })
              : t('admin.users.confirmDeactivate', { name: pending?.user.name })
        }
      />
    </div>
  );
}
