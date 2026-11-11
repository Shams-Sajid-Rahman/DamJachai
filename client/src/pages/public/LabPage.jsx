import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useLab, useMyReview } from '../../hooks/queries.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBasket } from '../../context/BasketContext.jsx';
import { publicApi } from '../../lib/publicApi.js';
import { formatDate, formatNumber, formatPrice, localName } from '../../lib/format.js';
import { getErrorMessage, getStatus } from '../../lib/errors.js';
import { Container } from '../../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { Icon } from '../../components/icons.jsx';
import { RatingInput, RatingStars } from '../../components/RatingStars.jsx';
import { PriceTag } from '../../components/PriceTag.jsx';
import { ReportTime } from '../../components/ReportTime.jsx';
import { VerifiedBadge } from '../../components/VerifiedBadge.jsx';
import { FavoriteButton } from '../../components/FavoriteButton.jsx';
import { LabBadges, LabLocation } from '../../components/LabCard.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

function mapUrl(lab) {
  if (lab.latitude != null && lab.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lab.latitude},${lab.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lab.name} ${lab.address || ''}`)}`;
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Icon name={icon} className="h-5 w-5 shrink-0 text-primary-dark" />
        {label}
      </dt>
      <dd className="pl-7 text-slate-700">{children}</dd>
    </div>
  );
}

function LabTests({ lab }) {
  const { t, lang } = useLang();
  const basket = useBasket();
  const [filter, setFilter] = useState('');
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return lab.tests;
    return lab.tests.filter((x) => `${x.nameEn} ${x.nameBn} ${x.slug}`.toLowerCase().includes(q));
  }, [lab.tests, filter]);

  return (
    <Card>
      <CardHeader
        title={t('lab.testsTitle', { count: lab.tests.length, n: formatNumber(lab.tests.length, lang) })}
        action={
          <Input
            aria-label={t('lab.filterTests')}
            placeholder={t('lab.filterTests')}
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-64"
          />
        }
      />
      {visible.length === 0 ? (
        <EmptyState compact title={t('common.noResults')} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((test) => {
            const inBasket = basket.has(test.id);
            return (
              <li key={test.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/tests/${test.slug}`} className="font-medium text-navy hover:text-primary-dark">
                    {localName(test, lang)}
                  </Link>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                    <span>{localName(test.category, lang)}</span>
                    <ReportTime hours={test.reportHours} />
                    <VerifiedBadge date={test.lastVerifiedAt} compact />
                  </p>
                </div>
                <PriceTag price={test.price} discountedPrice={test.discountedPrice} size="sm" />
                <Button variant="ghost" size="icon" onClick={() => basket.toggle(test)} aria-pressed={inBasket} aria-label={inBasket ? t('basket.removeTest', { name: test.nameEn }) : t('basket.addTest', { name: test.nameEn })}>
                  <Icon name={inBasket ? 'check' : 'plus'} className="h-5 w-5 text-primary-dark" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function ReviewForm({ lab }) {
  const { t } = useLang();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: mine } = useMyReview(lab.id);
  const [rating, setRating] = useState(0);
  const [onTime, setOnTime] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: publicApi.submitReview,
    onSuccess: () => {
      toast.success(t('review.submitted'));
      setRating(0);
      setOnTime('');
      setComment('');
      qc.invalidateQueries({ queryKey: ['my-review', lab.id] });
    },
    onError: (err) => toast.error(getErrorMessage(err, t)),
  });

  function onSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setErrors({ rating: t('review.ratingRequired') });
      return;
    }
    setErrors({});
    mutation.mutate({
      labId: lab.id,
      rating,
      reportOnTime: onTime === '' ? null : onTime === 'yes',
      comment: comment.trim() || undefined,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mine && (
        <div className="rounded-xl border border-primary/20 bg-mint p-3 text-sm text-slate-700" role="status">
          {t(`review.yourStatus.${mine.status}`)} {t('review.editHint')}
        </div>
      )}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">{t('review.rating')}</legend>
        <RatingInput value={rating} onChange={setRating} error={errors.rating} />
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">{t('review.onTime')}</legend>
        <div className="flex gap-2">
          {['yes', 'no'].map((v) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="onTime" value={v} checked={onTime === v} onChange={() => setOnTime(v)} className="peer sr-only" />
              <span className="inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-sm peer-checked:border-primary-dark peer-checked:bg-primary-dark peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                {t(`common.${v}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Input
        label={t('review.comment')}
        hint={t('review.commentHint')}
        multiline
        rows={3}
        maxLength={2000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="submit" loading={mutation.isPending}>{t('review.submit')}</Button>
    </form>
  );
}

function Reviews({ lab }) {
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Card>
      <CardHeader
        title={t('lab.reviewsTitle')}
        subtitle={lab.onTimePercent != null ? t('lab.onTime', { percent: formatNumber(lab.onTimePercent, lang) }) : undefined}
        action={<RatingStars value={lab.rating.average} count={lab.rating.count} size="md" />}
      />
      {lab.reviews.length === 0 ? (
        <p className="text-sm text-slate-500">{t('lab.noReviews')}</p>
      ) : (
        <ul className="space-y-4">
          {lab.reviews.map((r) => (
            <li key={r.id} className="rounded-xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <RatingStars value={r.rating} showValue={false} />
                <span className="text-xs text-slate-500">{r.userName} · {formatDate(r.createdAt, lang)}</span>
              </div>
              {r.reportOnTime != null && (
                <p className="mt-1 text-xs text-slate-500">
                  {r.reportOnTime ? t('review.wasOnTime') : t('review.wasLate')}
                </p>
              )}
              {r.comment && <p className="mt-2 text-sm text-slate-700">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="mb-3 font-semibold text-navy">{t('review.writeTitle')}</h3>
        {isAuthenticated ? (
          <ReviewForm lab={lab} />
        ) : (
          <p className="text-sm text-slate-600">
            <Link to="/login" state={{ from: location }} className="font-semibold text-primary-dark underline">{t('nav.login')}</Link>{' '}
            {t('review.loginToWrite')}
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">{t('review.moderationNote')}</p>
      </div>
    </Card>
  );
}

export default function LabPage() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const { data: lab, isPending, isError, error } = useLab(slug);

  usePageMeta({
    title: lab?.name || t('pages.lab.title'),
    description: lab ? t('lab.metaDescription', { name: lab.name, city: lab.city?.nameEn || '' }) : undefined,
  });

  if (isError && getStatus(error) === 404) return <NotFoundPage />;
  if (isError) return <Container className="py-16"><EmptyState icon="alert" title={t('errors.loadFailed')} /></Container>;

  return (
    <>
      <section className="border-b border-primary/10 bg-gradient-to-b from-white to-mint">
        <Container className="py-8 sm:py-10">
          <nav aria-label={t('compare.breadcrumb')} className="mb-3 text-sm text-slate-500">
            <Link to="/labs" className="hover:text-navy">{t('nav.labs')}</Link>
          </nav>
          {isPending ? (
            <div className="space-y-3"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-5 w-1/3" /></div>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-bold text-navy sm:text-3xl">{lab.name}</h1>
                <LabLocation lab={lab} />
                <RatingStars value={lab.rating.average} count={lab.rating.count} />
                <LabBadges lab={lab} />
              </div>
              <div className="flex flex-wrap gap-2">
                <FavoriteButton labId={lab.id} isFavorite={lab.isFavorite} />
                <Button href={mapUrl(lab)} target="_blank" rel="noopener noreferrer" variant="secondary">
                  <Icon name="mapPin" className="h-4 w-4" /> {t('lab.openMap')}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <Container className="py-8">
        {isPending ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]"><SkeletonCard lines={6} /><SkeletonCard lines={8} /></div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-6 lg:sticky lg:top-20">
              <Card>
                <CardHeader title={t('lab.detailsTitle')} />
                <dl className="space-y-4 text-sm">
                  {lab.address && <InfoRow icon="mapPin" label={t('lab.address')}>{lab.address}</InfoRow>}
                  {lab.phone && (
                    <InfoRow icon="phone" label={t('lab.phone')}>
                      <a href={`tel:${lab.phone.replace(/\s/g, '')}`} className="text-primary-dark hover:underline">{lab.phone}</a>
                    </InfoRow>
                  )}
                  {lab.openingHours && <InfoRow icon="clock" label={t('lab.openingHours')}>{lab.openingHours}</InfoRow>}
                  {lab.website && (
                    <InfoRow icon="external" label={t('lab.website')}>
                      <a href={lab.website} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary-dark hover:underline">
                        {lab.website.replace(/^https?:\/\//, '')}
                      </a>
                    </InfoRow>
                  )}
                  <InfoRow icon="home" label={t('lab.homeCollection')}>
                    {lab.homeCollection
                      ? lab.homeCollectionFee
                        ? t('lab.homeCollectionYesFee', { fee: formatPrice(lab.homeCollectionFee, lang) })
                        : t('lab.homeCollectionYes')
                      : t('lab.homeCollectionNo')}
                  </InfoRow>
                  <InfoRow icon="shield" label={t('lab.accreditation')}>
                    {lab.isAccredited ? lab.accreditationNote || t('lab.accredited') : t('lab.notAccredited')}
                  </InfoRow>
                </dl>
                {lab.isSample && (
                  <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{t('lab.sampleNotice')}</p>
                )}
              </Card>
              <Button to={`/report-price?lab=${lab.slug}`} variant="secondary" className="w-full">
                <Icon name="tag" className="h-4 w-4" /> {t('compare.reportDifferent')}
              </Button>
            </div>
            <div className="space-y-6">
              <LabTests lab={lab} />
              <Reviews lab={lab} />
              {lab.tests.length > 0 && (
                <p className="text-sm text-slate-500">
                  <Badge variant="slate" icon="info">{t('footer.disclaimer')}</Badge>
                </p>
              )}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
