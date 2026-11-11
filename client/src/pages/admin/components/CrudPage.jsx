import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../../hooks/useLang.js';
import { useDebounce } from '../../../hooks/useDebounce.js';
import { adminApi } from '../../../lib/adminApi.js';
import { getErrorMessage, getFieldErrors } from '../../../lib/errors.js';
import { formatNumber } from '../../../lib/format.js';
import { Table } from '../../../components/ui/Table.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Modal, ConfirmDialog } from '../../../components/ui/Modal.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { useToast } from '../../../components/ui/Toast.jsx';
import { Icon } from '../../../components/icons.jsx';
import { FormFields, requiredErrors } from './FormFields.jsx';
import { AdminPageHeader } from '../AdminLayout.jsx';

/**
 * A complete admin CRUD screen: search, filters, a sortable and paginated table,
 * a create/edit side drawer with validation, and a confirmed delete.
 *
 * Props:
 *  resource        API path under /api/admin (e.g. 'labs')
 *  title, description, entityName (singular, for "New lab" etc.)
 *  columns         Table columns; actions are added automatically
 *  filters         [{ key, label, options: [{value,label}] }] dropdown filters (sent as query params)
 *  sortDefault     { key, order }
 *  fields          form fields (see FormFields), or fields(mode, row)
 *  emptyValues     initial values for "create"
 *  toForm(row)     API row -> form values (edit)
 *  toPayload(values, mode)  form values -> request body
 *  extraActions(row)  extra buttons per row
 *  canDelete       default true
 *  header          false to hide the page header (when embedded in tabs)
 */
export function CrudPage({
  resource,
  title,
  description,
  entityName,
  columns,
  filters = [],
  sortDefault = { key: 'name', order: 'asc' },
  fields,
  emptyValues = {},
  toForm = (row) => row,
  toPayload = (values) => values,
  extraActions,
  canDelete = true,
  header = true,
  searchPlaceholder,
}) {
  const { t, lang } = useLang();
  const toast = useToast();
  const qc = useQueryClient();

  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 300);
  const [filterValues, setFilterValues] = useState({});
  const [sort, setSort] = useState(sortDefault);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null); // { mode: 'create' | 'edit', row?, values }
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const params = { q: debouncedQ, ...filterValues, sort: sort.key, order: sort.order, page, limit: 15 };
  const listQuery = useQuery({
    queryKey: ['admin', resource, params],
    queryFn: () => adminApi.list(resource, params),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin'] });
    // Public pages show the same data.
    ['tests', 'labs', 'lab', 'compare', 'cities', 'categories', 'stats'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };

  const save = useMutation({
    mutationFn: ({ mode, id, body }) => (mode === 'create' ? adminApi.create(resource, body) : adminApi.update(resource, id, body)),
    onSuccess: (_, vars) => {
      toast.success(vars.mode === 'create' ? t('admin.crud.created', { name: entityName }) : t('admin.crud.updated', { name: entityName }));
      setEditing(null);
      invalidate();
    },
    onError: (err) => {
      setFormErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, t));
    },
  });

  const remove = useMutation({
    mutationFn: (row) => adminApi.remove(resource, row.id),
    onSuccess: (result) => {
      toast.success(result?.result === 'hidden' ? t('admin.crud.hidden', { name: entityName }) : t('admin.crud.deleted', { name: entityName }));
      setDeleting(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, t));
      setDeleting(null);
    },
  });

  const formFields = (mode, row) => (typeof fields === 'function' ? fields(mode, row) : fields);

  function openCreate() {
    setFormErrors({});
    setFormError('');
    setEditing({ mode: 'create', values: { ...emptyValues } });
  }
  function openEdit(row) {
    setFormErrors({});
    setFormError('');
    setEditing({ mode: 'edit', row, values: toForm(row) });
  }
  function submit(e) {
    e.preventDefault();
    const list = formFields(editing.mode, editing.row);
    const errors = requiredErrors(list, editing.values, t);
    setFormErrors(errors);
    setFormError('');
    if (Object.keys(errors).length) return;
    save.mutate({ mode: editing.mode, id: editing.row?.id, body: toPayload(editing.values, editing.mode, editing.row) });
  }

  const onSort = (key) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));

  const tableColumns = [
    ...columns,
    {
      key: '_actions',
      header: <span className="sr-only">{t('admin.crud.actions')}</span>,
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {extraActions?.(row)}
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label={t('admin.crud.editRow', { name: row.name || row.nameEn || row.id })}>
            <Icon name="edit" className="h-4 w-4" />
          </Button>
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={() => setDeleting(row)} aria-label={t('admin.crud.deleteRow', { name: row.name || row.nameEn || row.id })}>
              <Icon name="trash" className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const meta = listQuery.data?.meta;

  return (
    <section>
      {header && (
        <AdminPageHeader
          title={title}
          description={description}
          actions={<Button onClick={openCreate}><Icon name="plus" className="h-4 w-4" /> {t('admin.crud.new', { name: entityName })}</Button>}
        />
      )}
      {!header && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          <Button size="sm" onClick={openCreate}><Icon name="plus" className="h-4 w-4" /> {t('admin.crud.new', { name: entityName })}</Button>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,2fr)_repeat(auto-fit,minmax(10rem,1fr))]">
        <Input
          aria-label={t('common.search')}
          type="search"
          placeholder={searchPlaceholder || t('admin.crud.search')}
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        {filters.map((f) => (
          <Select
            key={f.key}
            aria-label={f.label}
            value={filterValues[f.key] ?? ''}
            onChange={(e) => { setFilterValues((v) => ({ ...v, [f.key]: e.target.value })); setPage(1); }}
            placeholder={f.label}
            options={f.options || []}
          />
        ))}
      </div>

      {listQuery.isError ? (
        <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => listQuery.refetch()}>{t('common.retry')}</Button>} />
      ) : (
        <Table
          columns={tableColumns}
          rows={listQuery.data?.data ?? []}
          loading={listQuery.isPending}
          sort={sort}
          onSort={onSort}
          caption={title}
          className={listQuery.isFetching && !listQuery.isPending ? 'opacity-70' : ''}
          empty={<EmptyState compact icon="search" title={t('common.noResults')} action={<Button variant="secondary" size="sm" onClick={openCreate}>{t('admin.crud.new', { name: entityName })}</Button>} />}
        />
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{meta ? t('admin.crud.total', { n: formatNumber(meta.total, lang) }) : ''}</p>
        <Pagination page={page} totalPages={meta?.totalPages} onChange={setPage} />
      </div>

      <Modal
        open={!!editing}
        onClose={() => !save.isPending && setEditing(null)}
        variant="drawer"
        title={editing?.mode === 'create' ? t('admin.crud.new', { name: entityName }) : t('admin.crud.editTitle', { name: entityName })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={save.isPending}>{t('common.cancel')}</Button>
            <Button type="submit" form="crud-form" loading={save.isPending}>{t('common.save')}</Button>
          </>
        }
      >
        {editing && (
          <form id="crud-form" onSubmit={submit} noValidate className="space-y-4">
            {formError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
            <FormFields
              fields={formFields(editing.mode, editing.row)}
              values={editing.values}
              errors={formErrors}
              onChange={(values) => setEditing((e) => ({ ...e, values }))}
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting)}
        loading={remove.isPending}
        title={t('admin.crud.deleteTitle', { name: entityName })}
        message={t('admin.crud.deleteMessage', { item: deleting?.name || deleting?.nameEn || `#${deleting?.id}` })}
        confirmLabel={t('common.delete')}
      />
    </section>
  );
}
