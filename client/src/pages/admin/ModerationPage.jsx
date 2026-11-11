import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { adminApi } from '../../lib/adminApi.js';
import { formatDate, formatNumber, formatPrice, localName } from '../../lib/format.js';
import { getErrorMessage } from '../../lib/errors.js';
import { cn } from '../../lib/cn.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { Icon } from '../../components/icons.jsx';
import { RatingStars } from '../../components/RatingStars.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';

const STATUSES = ['pending', 'approved', 'rejected', 'all'];
const STATUS_BADGE = { pending: 'amber', approved: 'green', rejected: 'red' };

function PriceDiff({ current, reported }) {
  const { lang } = useLang();
  if (current == null) return null;
  const diff = reported - current;
  if (!diff) return null;
  const pct = Math.round((diff / current) * 100);
  return (
    <span className={cn('text-xs font-semibold', diff < 0 ? 'text-primary-dark' : 'text-coral-ink')}>
      {diff > 0 ? '+' : '−'}{formatPrice(Math.abs(diff), lang)} ({diff > 0 ? '+' : '−'}{formatNumber(Math.abs(pct), lang)}%)
    </span>
  );
}

/** A note box plus approve and reject buttons for one queue item. */
function Decision({ item, kind, onDone }) {
  const { t } = useLang();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [price, setPrice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const act = useMutation({
    mutationFn: ({ action, body }) => (action === 'delete' ? adminApi.remove(kind, item.id) : adminApi.moderate(kind, item.id, action, body)),
    onSuccess: (_, { action }) => {
      toast.success(t(`admin.moderation.done.${action}`));
      setConfirmDelete(false);
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err, t)),
  });

  if (item.status !== 'pending') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>
          {item.reviewedBy && t('admin.moderation.reviewedBy', { name: item.reviewedBy })}
          {item.reviewNote && <> · “{item.reviewNote}”</>}
        </span>
        {kind === 'reviews' && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}><Icon name="trash" className="h-4 w-4 text-red-600" /> {t('common.delete')}</Button>
        )}
        <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={() => act.mutate({ action: 'delete' })} loading={act.isPending} title={t('admin.moderation.deleteTitle')} message={t('admin.moderation.deleteMessage')} confirmLabel={t('common.delete')} />
      </div>
    );
  }

  const body = { note: note.trim() || undefined };
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Input label={t('admin.moderation.note')} placeholder={t('admin.moderation.notePlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
        {kind === 'price-reports' && (
          <Input label={t('admin.moderation.overridePrice')} hint={t('admin.moderation.overrideHint')} type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        )}
      </div>
      <div className="flex gap-2">
        {kind === 'reviews' && (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4 text-red-600" /></Button>
        )}
        <Button variant="secondary" onClick={() => act.mutate({ action: 'reject', body })} loading={act.isPending && act.variables?.action === 'reject'}>
          <Icon name="close" className="h-4 w-4" /> {t('admin.moderation.reject')}
        </Button>
        <Button onClick={() => act.mutate({ action: 'approve', body: { ...body, ...(price ? { price: Number(price) } : {}) } })} loading={act.isPending && act.variables?.action === 'approve'}>
          <Icon name="check" className="h-4 w-4" /> {t('admin.moderation.approve')}
        </Button>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={() => act.mutate({ action: 'delete' })} loading={act.isPending} title={t('admin.moderation.deleteTitle')} message={t('admin.moderation.deleteMessage')} confirmLabel={t('common.delete')} />
    </div>
  );
}

function ReportItem({ item, onDone }) {
  const { t, lang } = useLang();
  return (
    <Card as="li" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-navy">
            <Link to={`/tests/${item.test.slug}`} className="hover:text-primary-dark">{localName(item.test, lang)}</Link>
            {' · '}
            <Link to={`/labs/${item.lab.slug}`} className="hover:text-primary-dark">{item.lab.name}</Link>
          </p>
          <p className="text-xs text-slate-500">{t('admin.moderation.by', { name: item.user.name, email: item.user.email })} · {formatDate(item.createdAt, lang)}</p>
        </div>
        <Badge variant={STATUS_BADGE[item.status]}>{t(`report.status.${item.status}`)}</Badge>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-xs text-slate-500">{t('admin.moderation.reported')}</p>
          <p className="text-xl font-bold tabular-nums text-navy">{formatPrice(item.reportedPrice, lang)}</p>
          <PriceDiff current={item.current?.price} reported={item.reportedPrice} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{t('admin.moderation.current')}</p>
          <p className="text-xl font-bold tabular-nums text-slate-500">{item.current ? formatPrice(item.current.price, lang) : t('admin.moderation.noCurrent')}</p>
          {item.current?.lastVerifiedAt && <p className="text-xs text-slate-500">{t('price.lastVerified')}: {formatDate(item.current.lastVerifiedAt, lang)}</p>}
        </div>
      </div>
      {item.note && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">“{item.note}”</p>}
      <Decision item={item} kind="price-reports" onDone={onDone} />
    </Card>
  );
}

function ReviewItem({ item, onDone }) {
  const { t, lang } = useLang();
  return (
    <Card as="li" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={`/labs/${item.lab.slug}`} className="font-semibold text-navy hover:text-primary-dark">{item.lab.name}</Link>
          <p className="text-xs text-slate-500">{t('admin.moderation.by', { name: item.user.name, email: item.user.email })} · {formatDate(item.createdAt, lang)}</p>
        </div>
        <Badge variant={STATUS_BADGE[item.status]}>{t(`report.status.${item.status}`)}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <RatingStars value={item.rating} size="md" />
        {item.reportOnTime != null && <span className="text-sm text-slate-600">{item.reportOnTime ? t('review.wasOnTime') : t('review.wasLate')}</span>}
      </div>
      {item.comment ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{item.comment}</p> : <p className="text-sm italic text-slate-400">{t('admin.moderation.noComment')}</p>}
      <Decision item={item} kind="reviews" onDone={onDone} />
    </Card>
  );
}

/** Review queue for price reports (`kind="price-reports"`) or reviews (`kind="reviews"`). */
export default function ModerationPage({ kind }) {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const params = { status, page, limit: 10, order: status === 'pending' ? 'asc' : 'desc' };
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['admin', kind, params],
    queryFn: () => adminApi.list(kind, params),
    placeholderData: keepPreviousData,
  });
  const onDone = () => {
    qc.invalidateQueries({ queryKey: ['admin'] });
    qc.invalidateQueries({ queryKey: ['compare'] });
    qc.invalidateQueries({ queryKey: ['lab'] });
  };
  const Item = kind === 'reviews' ? ReviewItem : ReportItem;
  const title = kind === 'reviews' ? t('admin.nav.reviews') : t('admin.nav.reports');

  return (
    <div>
      <AdminPageHeader title={title} description={kind === 'reviews' ? t('admin.moderation.reviewsDescription') : t('admin.moderation.reportsDescription')} />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={cn('rounded-full px-4 py-2 text-sm font-medium', status === s ? 'bg-navy text-white' : 'bg-white text-slate-600 hover:text-navy')}
          >
            {s === 'all' ? t('common.all') : t(`report.status.${s}`)}
          </button>
        ))}
      </div>
      {isError && <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />}
      {isPending && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}</div>}
      {data && data.data.length === 0 && (
        <EmptyState icon="checkCircle" title={status === 'pending' ? t('admin.moderation.allDone') : t('common.noResults')} />
      )}
      {data && data.data.length > 0 && (
        <>
          <p className="mb-3 text-sm text-slate-500">{t('admin.crud.total', { n: formatNumber(data.meta.total, lang) })}</p>
          <ul className="space-y-4">{data.data.map((item) => <Item key={item.id} item={item} onDone={onDone} />)}</ul>
        </>
      )}
      <Pagination className="mt-6" page={page} totalPages={data?.meta.totalPages} onChange={setPage} />
    </div>
  );
}
