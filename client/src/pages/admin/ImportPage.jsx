import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { adminApi } from '../../lib/adminApi.js';
import { formatNumber, formatPrice } from '../../lib/format.js';
import { getErrorMessage } from '../../lib/errors.js';
import { cn } from '../../lib/cn.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { Icon } from '../../components/icons.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';

const ACTION_BADGE = { create: 'teal', update: 'navy', unchanged: 'slate', error: 'red' };
const MAX_BYTES = 1024 * 1024;

/** CSV import in two steps: upload and preview (nothing saved), then confirm to save the valid rows. */
export default function ImportPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const qc = useQueryClient();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [applied, setApplied] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [onlyErrors, setOnlyErrors] = useState(false);

  const previewMutation = useMutation({
    mutationFn: (f) => adminApi.importPrices(f, false),
    onSuccess: (data) => setPreview(data),
    onError: (err) => toast.error(getErrorMessage(err, t)),
  });
  const confirmMutation = useMutation({
    mutationFn: () => adminApi.importPrices(file, true),
    onSuccess: (data) => {
      setApplied(data.applied);
      setPreview(null);
      setConfirming(false);
      toast.success(t('admin.import.done'));
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['compare'] });
    },
    onError: (err) => {
      setConfirming(false);
      toast.error(getErrorMessage(err, t));
    },
  });

  function choose(e) {
    const f = e.target.files?.[0];
    setPreview(null);
    setApplied(null);
    if (!f) return setFile(null);
    if (!/\.csv$/i.test(f.name)) {
      toast.error(t('admin.import.onlyCsv'));
      e.target.value = '';
      return setFile(null);
    }
    if (f.size > MAX_BYTES) {
      toast.error(t('admin.import.tooBig'));
      e.target.value = '';
      return setFile(null);
    }
    setFile(f);
    previewMutation.mutate(f);
  }

  async function downloadTemplate() {
    try {
      const blob = await adminApi.importTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'damjachai-price-import-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    }
  }

  const rows = preview ? (onlyErrors ? preview.rows.filter((r) => r.errors.length) : preview.rows) : [];
  const s = preview?.summary;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('admin.nav.import')}
        description={t('admin.import.description')}
        actions={<Button variant="secondary" onClick={downloadTemplate}><Icon name="download" className="h-4 w-4" /> {t('admin.import.template')}</Button>}
      />

      <Card>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-10 text-center">
          <Icon name="upload" className="h-10 w-10 text-primary" />
          <p className="font-medium text-navy">{file ? file.name : t('admin.import.chooseFile')}</p>
          <p className="text-sm text-slate-500">{t('admin.import.columns')}</p>
          <input ref={inputRef} id="csv-file" type="file" accept=".csv,text/csv" className="sr-only" onChange={choose} />
          <Button onClick={() => inputRef.current?.click()} loading={previewMutation.isPending}>
            {file ? t('admin.import.chooseOther') : t('admin.import.selectCsv')}
          </Button>
        </div>
      </Card>

      {applied && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="flex items-center gap-2 font-semibold text-emerald-800"><Icon name="checkCircle" /> {t('admin.import.done')}</p>
          <p className="mt-1 text-sm text-emerald-800">
            {t('admin.import.appliedSummary', {
              create: formatNumber(applied.create, lang),
              update: formatNumber(applied.update, lang),
              unchanged: formatNumber(applied.unchanged, lang),
              skipped: formatNumber(applied.skipped, lang),
            })}
          </p>
        </Card>
      )}

      {preview && (
        <>
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              ['total', s.total, 'text-navy'],
              ['create', s.create, 'text-primary-dark'],
              ['update', s.update, 'text-navy'],
              ['unchanged', s.unchanged, 'text-slate-500'],
              ['errors', s.errors, s.errors ? 'text-red-600' : 'text-navy'],
            ].map(([key, value, tone]) => (
              <Card key={key} className="py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t(`admin.import.summary.${key}`)}</p>
                <p className={cn('mt-1 text-2xl font-bold tabular-nums', tone)}>{formatNumber(value, lang)}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
              {t('admin.import.onlyErrors')}
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setPreview(null); setFile(null); if (inputRef.current) inputRef.current.value = ''; }}>{t('common.cancel')}</Button>
              <Button onClick={() => setConfirming(true)} disabled={!s.valid}>
                <Icon name="check" className="h-4 w-4" /> {t('admin.import.confirm', { n: formatNumber(s.valid, lang) })}
              </Button>
            </div>
          </div>

          <Table
            caption={t('admin.import.previewCaption')}
            rowKey={(r) => r.row}
            rows={rows}
            rowClassName={(r) => (r.errors.length ? 'bg-red-50/60' : '')}
            columns={[
              { key: 'row', header: t('admin.import.row'), render: (r) => formatNumber(r.row, lang) },
              { key: 'action', header: t('admin.import.result'), render: (r) => <Badge variant={ACTION_BADGE[r.action]}>{t(`admin.import.actions.${r.action}`)}</Badge> },
              { key: 'lab', header: t('compare.lab'), render: (r) => r.labName || <code className="text-xs">{r.labSlug}</code> },
              { key: 'test', header: t('admin.entities.test'), render: (r) => r.testName || <code className="text-xs">{r.testSlug}</code> },
              {
                key: 'price', header: t('compare.price'),
                render: (r) => (
                  <span className="whitespace-nowrap tabular-nums">
                    {r.oldPrice != null && r.action === 'update' && <span className="mr-1 text-slate-400 line-through">{formatPrice(r.oldPrice, lang)}</span>}
                    {typeof r.price === 'number' ? formatPrice(r.price, lang) : String(r.price ?? '')}
                  </span>
                ),
              },
              { key: 'errors', header: t('admin.import.errors'), render: (r) => <span className="text-sm text-red-700">{r.errors.join('; ')}</span> },
            ]}
          />
        </>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => confirmMutation.mutate()}
        loading={confirmMutation.isPending}
        danger={false}
        title={t('admin.import.confirmTitle')}
        message={t('admin.import.confirmMessage', { valid: formatNumber(s?.valid ?? 0, lang), errors: formatNumber(s?.errors ?? 0, lang) })}
        confirmLabel={t('admin.import.saveNow')}
      />
    </div>
  );
}
