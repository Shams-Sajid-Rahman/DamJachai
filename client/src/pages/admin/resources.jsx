import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { adminApi } from '../../lib/adminApi.js';
import { formatDate, formatNumber, formatPrice, isStale, localName } from '../../lib/format.js';
import { getErrorMessage } from '../../lib/errors.js';
import { cn } from '../../lib/cn.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { Icon } from '../../components/icons.jsx';
import { CrudPage } from './components/CrudPage.jsx';
import { splitTags, toIdOrNull, toNumberOrNull, toOptional, toTextOrNull } from './components/FormFields.jsx';

export const OPTIONS_KEY = ['admin', 'options'];
export const useAdminOptions = () => useQuery({ queryKey: OPTIONS_KEY, queryFn: adminApi.options, staleTime: 60_000 });

const StatusBadge = ({ status }) => {
  const { t } = useLang();
  return <Badge variant={status === 'active' ? 'green' : 'slate'}>{t(`admin.status.${status}`)}</Badge>;
};

const DateCell = ({ value, warnIfStale }) => {
  const { lang } = useLang();
  if (!value) return <span className="text-slate-400">—</span>;
  const stale = warnIfStale && isStale(value);
  return (
    <span className={cn('whitespace-nowrap', stale && 'font-semibold text-amber-700')}>
      {stale && <Icon name="alert" className="mr-1 inline h-3.5 w-3.5" />}
      {formatDate(value, lang)}
    </span>
  );
};

// ---------------- Labs ----------------

export function LabsAdmin() {
  const { t, lang } = useLang();
  const { data: options } = useAdminOptions();
  const cityOptions = (options?.cities ?? []).map((c) => ({ value: String(c.id), label: localName(c, lang) }));
  const areaOptionsFor = (cityId) =>
    (options?.cities.find((c) => String(c.id) === String(cityId))?.areas ?? []).map((a) => ({ value: String(a.id), label: localName(a, lang) }));

  return (
    <CrudPage
      resource="labs"
      title={t('admin.nav.labs')}
      description={t('admin.labs.description')}
      entityName={t('admin.entities.lab')}
      sortDefault={{ key: 'name', order: 'asc' }}
      filters={[
        { key: 'cityId', label: t('filters.allCities'), options: cityOptions },
        { key: 'status', label: t('admin.status.any'), options: ['active', 'hidden'].map((s) => ({ value: s, label: t(`admin.status.${s}`) })) },
      ]}
      columns={[
        {
          key: 'name', header: t('admin.fields.name'), sortKey: 'name',
          render: (r) => (
            <div>
              <p className="font-medium text-navy">{r.name}</p>
              <p className="text-xs text-slate-500">{r.slug}</p>
            </div>
          ),
        },
        { key: 'city', header: t('admin.fields.location'), render: (r) => [localName(r.area, lang), localName(r.city, lang)].filter(Boolean).join(', ') },
        {
          key: 'flags', header: t('admin.fields.features'),
          render: (r) => (
            <div className="flex flex-wrap gap-1">
              {r.isAccredited && <Badge variant="teal">{t('lab.accredited')}</Badge>}
              {r.homeCollection && <Badge variant="slate">{t('lab.homeCollection')}</Badge>}
              {r.isSample && <Badge variant="amber">{t('common.sampleData')}</Badge>}
            </div>
          ),
        },
        { key: 'priceCount', header: t('admin.fields.prices'), sortKey: 'prices', render: (r) => formatNumber(r.priceCount, lang) },
        { key: 'oldestVerifiedAt', header: t('admin.fields.oldestVerified'), sortKey: 'oldest_verified', render: (r) => <DateCell value={r.oldestVerifiedAt} warnIfStale /> },
        { key: 'status', header: t('admin.fields.status'), render: (r) => <StatusBadge status={r.status} /> },
      ]}
      emptyValues={{ status: 'active', isAccredited: false, homeCollection: false, isSample: false }}
      fields={[
        { name: 'name', label: t('admin.fields.name'), required: true },
        { name: 'slug', label: t('admin.fields.slug'), hint: t('admin.fields.slugHint') },
        { name: 'cityId', label: t('filters.city'), type: 'select', required: true, options: cityOptions },
        { name: 'areaId', label: t('filters.area'), type: 'select', options: (v) => areaOptionsFor(v.cityId), placeholder: t('admin.form.none'), disabled: (v) => !v.cityId },
        { name: 'address', label: t('lab.address'), type: 'textarea' },
        { name: 'phone', label: t('lab.phone') },
        { name: 'website', label: t('lab.website'), type: 'url', placeholder: 'https://' },
        { name: 'latitude', label: t('admin.fields.latitude'), type: 'number', step: 'any' },
        { name: 'longitude', label: t('admin.fields.longitude'), type: 'number', step: 'any' },
        { name: 'openingHours', label: t('lab.openingHours'), wide: true },
        { name: 'isAccredited', label: t('lab.accredited'), type: 'toggle' },
        { name: 'accreditationNote', label: t('admin.fields.accreditationNote'), hidden: (v) => !v.isAccredited },
        { name: 'homeCollection', label: t('lab.homeCollection'), type: 'toggle' },
        { name: 'homeCollectionFee', label: t('admin.fields.homeCollectionFee'), type: 'number', hidden: (v) => !v.homeCollection },
        { name: 'isSample', label: t('admin.fields.isSample'), type: 'toggle', hint: t('admin.fields.isSampleHint') },
        { name: 'status', label: t('admin.fields.status'), type: 'select', required: true, options: ['active', 'hidden'].map((s) => ({ value: s, label: t(`admin.status.${s}`) })) },
      ]}
      toForm={(r) => ({
        ...r,
        cityId: String(r.cityId),
        areaId: r.areaId ? String(r.areaId) : '',
        latitude: r.latitude ?? '',
        longitude: r.longitude ?? '',
        homeCollectionFee: r.homeCollectionFee ?? '',
      })}
      toPayload={(v) => ({
        name: v.name.trim(),
        slug: toOptional(v.slug),
        cityId: Number(v.cityId),
        areaId: toIdOrNull(v.areaId),
        address: toTextOrNull(v.address),
        phone: toTextOrNull(v.phone),
        website: toTextOrNull(v.website),
        latitude: toNumberOrNull(v.latitude),
        longitude: toNumberOrNull(v.longitude),
        openingHours: toTextOrNull(v.openingHours),
        isAccredited: !!v.isAccredited,
        accreditationNote: v.isAccredited ? toTextOrNull(v.accreditationNote) : null,
        homeCollection: !!v.homeCollection,
        homeCollectionFee: v.homeCollection ? toNumberOrNull(v.homeCollectionFee) : null,
        isSample: !!v.isSample,
        status: v.status,
      })}
    />
  );
}

// ---------------- Tests ----------------

export function TestsAdmin() {
  const { t, lang } = useLang();
  const { data: options } = useAdminOptions();
  const categoryOptions = (options?.categories ?? []).map((c) => ({ value: String(c.id), label: localName(c, lang) }));

  return (
    <CrudPage
      resource="tests"
      title={t('admin.nav.tests')}
      description={t('admin.tests.description')}
      entityName={t('admin.entities.test')}
      filters={[
        { key: 'categoryId', label: t('admin.fields.allCategories'), options: categoryOptions },
        { key: 'status', label: t('admin.status.any'), options: ['active', 'hidden'].map((s) => ({ value: s, label: t(`admin.status.${s}`) })) },
      ]}
      columns={[
        {
          key: 'name', header: t('admin.fields.name'), sortKey: 'name',
          render: (r) => (
            <div>
              <p className="font-medium text-navy">{r.nameEn}</p>
              <p className="text-xs text-slate-500">{r.nameBn} · {r.slug}</p>
            </div>
          ),
        },
        { key: 'category', header: t('admin.fields.category'), render: (r) => localName(r.category, lang) },
        {
          key: 'aliases', header: t('admin.fields.aliases'),
          render: (r) => <span className="line-clamp-2 max-w-xs text-xs text-slate-500">{r.aliases.join(', ')}</span>,
        },
        { key: 'priceCount', header: t('admin.fields.prices'), sortKey: 'prices', render: (r) => formatNumber(r.priceCount, lang) },
        { key: 'searchCount', header: t('admin.fields.views'), sortKey: 'searches', render: (r) => formatNumber(r.searchCount, lang) },
        { key: 'status', header: t('admin.fields.status'), render: (r) => <StatusBadge status={r.status} /> },
      ]}
      emptyValues={{ status: 'active', aliases: '' }}
      fields={[
        { name: 'nameEn', label: t('admin.fields.nameEn'), required: true },
        { name: 'nameBn', label: t('admin.fields.nameBn'), required: true },
        { name: 'categoryId', label: t('admin.fields.category'), type: 'select', required: true, options: categoryOptions },
        { name: 'slug', label: t('admin.fields.slug'), hint: t('admin.fields.slugHint') },
        { name: 'sampleType', label: t('compare.sample'), placeholder: 'Blood' },
        { name: 'status', label: t('admin.fields.status'), type: 'select', required: true, options: ['active', 'hidden'].map((s) => ({ value: s, label: t(`admin.status.${s}`) })) },
        { name: 'aliases', label: t('admin.fields.aliases'), type: 'tags', hint: t('admin.fields.aliasesHint'), placeholder: 'CBC, complete blood count, সিবিসি' },
        { name: 'description', label: t('compare.about'), type: 'textarea' },
        { name: 'preparationNote', label: t('compare.preparation'), type: 'textarea', hint: t('admin.fields.preparationHint') },
      ]}
      toForm={(r) => ({ ...r, categoryId: String(r.categoryId), aliases: r.aliases.join(', ') })}
      toPayload={(v) => ({
        nameEn: v.nameEn.trim(),
        nameBn: v.nameBn.trim(),
        categoryId: Number(v.categoryId),
        slug: toOptional(v.slug),
        sampleType: toTextOrNull(v.sampleType),
        status: v.status,
        aliases: splitTags(v.aliases),
        description: toTextOrNull(v.description),
        preparationNote: toTextOrNull(v.preparationNote),
      })}
    />
  );
}

// ---------------- Categories ----------------

const nameFields = (t) => [
  { name: 'nameEn', label: t('admin.fields.nameEn'), required: true },
  { name: 'nameBn', label: t('admin.fields.nameBn'), required: true },
  { name: 'slug', label: t('admin.fields.slug'), hint: t('admin.fields.slugHint'), wide: true },
];
const namePayload = (v) => ({ nameEn: v.nameEn.trim(), nameBn: v.nameBn.trim(), slug: toOptional(v.slug) });

export function CategoriesAdmin() {
  const { t, lang } = useLang();
  return (
    <CrudPage
      resource="categories"
      title={t('admin.nav.categories')}
      description={t('admin.categories.description')}
      entityName={t('admin.entities.category')}
      columns={[
        { key: 'nameEn', header: t('admin.fields.nameEn'), sortKey: 'name', render: (r) => <span className="font-medium text-navy">{r.nameEn}</span> },
        { key: 'nameBn', header: t('admin.fields.nameBn') },
        { key: 'slug', header: t('admin.fields.slug'), render: (r) => <code className="text-xs">{r.slug}</code> },
        { key: 'testCount', header: t('admin.fields.tests'), sortKey: 'count', render: (r) => formatNumber(r.testCount, lang) },
      ]}
      fields={nameFields(t)}
      toPayload={namePayload}
    />
  );
}

// ---------------- Cities and areas ----------------

export function LocationsAdmin() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState('cities');
  const { data: options } = useAdminOptions();
  const cityOptions = (options?.cities ?? []).map((c) => ({ value: String(c.id), label: localName(c, lang) }));
  const tabClass = (active) =>
    cn('rounded-full px-4 py-2 text-sm font-medium', active ? 'bg-navy text-white' : 'bg-white text-slate-600 hover:text-navy');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">{t('admin.nav.locations')}</h1>
        <p className="mt-1 text-sm text-slate-600">{t('admin.locations.description')}</p>
      </div>
      <div className="mb-5 flex gap-2" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'cities'} className={tabClass(tab === 'cities')} onClick={() => setTab('cities')}>{t('admin.locations.cities')}</button>
        <button type="button" role="tab" aria-selected={tab === 'areas'} className={tabClass(tab === 'areas')} onClick={() => setTab('areas')}>{t('admin.locations.areas')}</button>
      </div>
      {tab === 'cities' ? (
        <CrudPage
          key="cities"
          header={false}
          resource="cities"
          title={t('admin.locations.cities')}
          entityName={t('admin.entities.city')}
          columns={[
            { key: 'nameEn', header: t('admin.fields.nameEn'), sortKey: 'name', render: (r) => <span className="font-medium text-navy">{r.nameEn}</span> },
            { key: 'nameBn', header: t('admin.fields.nameBn') },
            { key: 'slug', header: t('admin.fields.slug'), render: (r) => <code className="text-xs">{r.slug}</code> },
            { key: 'areaCount', header: t('admin.locations.areas'), render: (r) => formatNumber(r.areaCount, lang) },
            { key: 'labCount', header: t('admin.nav.labs'), sortKey: 'count', render: (r) => formatNumber(r.labCount, lang) },
          ]}
          fields={nameFields(t)}
          toPayload={namePayload}
        />
      ) : (
        <CrudPage
          key="areas"
          header={false}
          resource="areas"
          title={t('admin.locations.areas')}
          entityName={t('admin.entities.area')}
          filters={[{ key: 'cityId', label: t('filters.allCities'), options: cityOptions }]}
          columns={[
            { key: 'nameEn', header: t('admin.fields.nameEn'), sortKey: 'name', render: (r) => <span className="font-medium text-navy">{r.nameEn}</span> },
            { key: 'nameBn', header: t('admin.fields.nameBn') },
            { key: 'city', header: t('filters.city'), render: (r) => localName(r.city, lang) },
            { key: 'labCount', header: t('admin.nav.labs'), sortKey: 'count', render: (r) => formatNumber(r.labCount, lang) },
          ]}
          fields={[{ name: 'cityId', label: t('filters.city'), type: 'select', required: true, options: cityOptions }, ...nameFields(t)]}
          toForm={(r) => ({ ...r, cityId: String(r.cityId) })}
          toPayload={(v) => ({ ...namePayload(v), cityId: Number(v.cityId) })}
        />
      )}
    </div>
  );
}

// ---------------- Lab prices ----------------

function VerifyButton({ row }) {
  const { t } = useLang();
  const toast = useToast();
  const qc = useQueryClient();
  const verify = useMutation({
    mutationFn: () => adminApi.verifyPrice(row.id),
    onSuccess: () => {
      toast.success(t('admin.prices.verified'));
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['compare'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, t)),
  });
  return (
    <Button variant="ghost" size="icon" onClick={() => verify.mutate()} loading={verify.isPending} aria-label={t('admin.prices.verifyRow')} title={t('admin.prices.verifyRow')}>
      {!verify.isPending && <Icon name="checkCircle" className="h-4 w-4 text-primary-dark" />}
    </Button>
  );
}

export function PricesAdmin() {
  const { t, lang } = useLang();
  const { data: options } = useAdminOptions();
  const labOptions = (options?.labs ?? []).map((l) => ({ value: String(l.id), label: l.name }));
  const testOptions = (options?.tests ?? []).map((x) => ({ value: String(x.id), label: localName(x, lang) }));

  return (
    <CrudPage
      resource="lab-tests"
      title={t('admin.nav.prices')}
      description={t('admin.prices.description')}
      entityName={t('admin.entities.price')}
      searchPlaceholder={t('admin.prices.search')}
      sortDefault={{ key: 'updated', order: 'desc' }}
      filters={[
        { key: 'labId', label: t('admin.prices.allLabs'), options: labOptions },
        { key: 'source', label: t('admin.prices.allSources'), options: ['admin', 'user_report', 'import'].map((s) => ({ value: s, label: t(`admin.sources.${s}`) })) },
        { key: 'staleDays', label: t('admin.prices.anyAge'), options: [90, 180].map((d) => ({ value: String(d), label: t('admin.prices.olderThan', { days: d }) })) },
      ]}
      columns={[
        { key: 'lab', header: t('compare.lab'), sortKey: 'lab', render: (r) => <span className="font-medium text-navy">{r.lab.name}</span> },
        { key: 'test', header: t('admin.entities.test'), sortKey: 'test', render: (r) => localName(r.test, lang) },
        {
          key: 'price', header: t('compare.price'), sortKey: 'price',
          render: (r) => (
            <span className="whitespace-nowrap font-semibold tabular-nums text-navy">
              {formatPrice(r.discountedPrice ?? r.price, lang)}
              {r.discountedPrice != null && <span className="ml-1 text-xs font-normal text-slate-500 line-through">{formatPrice(r.price, lang)}</span>}
            </span>
          ),
        },
        { key: 'reportHours', header: t('compare.reportTime'), render: (r) => (r.reportHours ? `${formatNumber(r.reportHours, lang)}h` : '—') },
        { key: 'lastVerifiedAt', header: t('compare.verified'), sortKey: 'verified', render: (r) => <DateCell value={r.lastVerifiedAt} warnIfStale /> },
        { key: 'source', header: t('admin.fields.source'), render: (r) => <Badge variant="slate">{t(`admin.sources.${r.source}`)}</Badge> },
      ]}
      extraActions={(row) => <VerifyButton row={row} />}
      fields={(mode) => [
        { name: 'labId', label: t('compare.lab'), type: 'select', required: true, options: labOptions, disabled: mode === 'edit' },
        { name: 'testId', label: t('admin.entities.test'), type: 'select', required: true, options: testOptions, disabled: mode === 'edit' },
        { name: 'price', label: t('admin.fields.priceTaka'), type: 'number', required: true },
        { name: 'discountedPrice', label: t('admin.fields.discountedPrice'), type: 'number', hint: t('admin.fields.discountHint') },
        { name: 'reportHours', label: t('admin.fields.reportHours'), type: 'number' },
      ]}
      toForm={(r) => ({ labId: String(r.labId), testId: String(r.testId), price: r.price, discountedPrice: r.discountedPrice ?? '', reportHours: r.reportHours ?? '' })}
      toPayload={(v, mode) => {
        const body = { price: Number(v.price), discountedPrice: toNumberOrNull(v.discountedPrice), reportHours: toNumberOrNull(v.reportHours) };
        return mode === 'create' ? { ...body, labId: Number(v.labId), testId: Number(v.testId) } : body;
      }}
    />
  );
}
