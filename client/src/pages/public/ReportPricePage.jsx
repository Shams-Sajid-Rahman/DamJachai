import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useMyReports } from '../../hooks/queries.js';
import { publicApi } from '../../lib/publicApi.js';
import { formatDate, formatPrice, localName } from '../../lib/format.js';
import { getErrorMessage, getFieldErrors } from '../../lib/errors.js';
import { PageHeader, Container } from '../../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Icon } from '../../components/icons.jsx';
import { SearchBar } from '../../components/SearchBar.jsx';

const STATUS_BADGE = { pending: 'amber', approved: 'green', rejected: 'red' };

function MyReports() {
  const { t, lang } = useLang();
  const { data = [], isPending } = useMyReports();
  return (
    <Card>
      <CardHeader title={t('report.myReports')} />
      {isPending ? (
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">{t('report.noReports')}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((r) => (
            <li key={r.id} className="py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-navy">{localName(r.test, lang)} · {r.lab.name}</span>
                <Badge variant={STATUS_BADGE[r.status]}>{t(`report.status.${r.status}`)}</Badge>
              </div>
              <p className="mt-0.5 text-slate-500">
                {formatPrice(r.reportedPrice, lang)} · {formatDate(r.createdAt, lang)}
              </p>
              {r.reviewNote && <p className="mt-1 text-xs text-slate-500">{t('report.adminNote')}: {r.reviewNote}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function ReportPricePage() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [labSlug, setLabSlug] = useState(params.get('lab') || '');
  const [test, setTest] = useState(null);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(null);

  usePageMeta({ title: t('pages.reportPrice.title') });

  const labs = useQuery({ queryKey: ['labs', 'all-for-select'], queryFn: () => publicApi.listLabs({ limit: 100, sort: 'name' }) });
  const testSlug = params.get('test');
  const prefilled = useQuery({ queryKey: ['test', testSlug], queryFn: () => publicApi.getTest(testSlug), enabled: !!testSlug });
  useEffect(() => {
    if (prefilled.data && !test) setTest(prefilled.data);
  }, [prefilled.data, test]);

  const labOptions = (labs.data?.data ?? []).map((l) => ({ value: l.slug, label: `${l.name} (${localName(l.area || l.city, lang)})` }));
  const selectedLab = labs.data?.data.find((l) => l.slug === labSlug);

  const mutation = useMutation({
    mutationFn: publicApi.createPriceReport,
    onSuccess: (report) => {
      setDone({ ...report, labName: selectedLab?.name, test });
      qc.invalidateQueries({ queryKey: ['my-reports'] });
    },
    onError: (err) => {
      const fields = getFieldErrors(err);
      setErrors({ lab: fields.labId, test: fields.testId, price: fields.reportedPrice, note: fields.note });
      setFormError(getErrorMessage(err, t));
    },
  });

  function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const next = {};
    if (!selectedLab) next.lab = t('report.pickLab');
    if (!test) next.test = t('report.pickTest');
    const amount = Number(price);
    if (!price || !Number.isFinite(amount) || amount <= 0) next.price = t('validation.positivePrice');
    setErrors(next);
    if (Object.keys(next).length) return;
    mutation.mutate({ labId: selectedLab.id, testId: test.id, reportedPrice: amount, note: note.trim() || undefined });
  }

  function reset() {
    setDone(null);
    setPrice('');
    setNote('');
    setTest(null);
    mutation.reset();
  }

  return (
    <>
      <PageHeader title={t('pages.reportPrice.title')} subtitle={t('pages.reportPrice.subtitle')} />
      <Container className="grid items-start gap-6 py-8 lg:grid-cols-[3fr_2fr]">
        <Card>
          {done ? (
            <EmptyState
              icon="checkCircle"
              title={t('report.thanksTitle')}
              description={t('report.thanksText', { test: localName(done.test, lang), lab: done.labName, price: formatPrice(done.reportedPrice, lang) })}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={reset}>{t('report.another')}</Button>
                  {done.test && <Button to={`/tests/${done.test.slug}`} variant="secondary">{t('report.backToCompare')}</Button>}
                </div>
              }
            />
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {formError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
              )}
              <Select
                label={t('report.lab')}
                required
                value={labSlug}
                onChange={(e) => setLabSlug(e.target.value)}
                placeholder={labs.isPending ? t('common.loading') : t('report.pickLab')}
                options={labOptions}
                error={errors.lab}
              />
              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-slate-700">
                  {t('report.test')} <span className="text-coral" aria-hidden="true">*</span>
                </span>
                {test ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-mint px-4 py-3">
                    <span className="font-medium text-navy">{localName(test, lang)}</span>
                    <Button variant="link" onClick={() => setTest(null)}>{t('report.changeTest')}</Button>
                  </div>
                ) : (
                  <SearchBar onSelect={setTest} placeholder={t('report.searchTest')} buttonLabel={t('common.search')} />
                )}
                {errors.test && <p className="text-sm text-red-600" role="alert">{errors.test}</p>}
              </div>
              <Input
                label={t('report.price')}
                required
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                hint={t('report.priceHint')}
                error={errors.price}
              />
              <Input
                label={`${t('report.note')} (${t('common.optional')})`}
                multiline
                rows={3}
                maxLength={1000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                hint={t('report.noteHint')}
                error={errors.note}
              />
              <Button type="submit" size="lg" loading={mutation.isPending}>
                <Icon name="tag" className="h-5 w-5" /> {t('report.submit')}
              </Button>
              <p className="text-xs text-slate-500">{t('report.reviewNotice')}</p>
            </form>
          )}
        </Card>
        <div className="space-y-6">
          <MyReports />
          <p className="text-sm text-slate-500">
            {t('report.lookingFor')} <Link to="/tests" className="font-medium text-primary-dark underline">{t('nav.tests')}</Link>
          </p>
        </div>
      </Container>
    </>
  );
}
