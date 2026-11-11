import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLang } from '../../hooks/useLang.js';
import { adminApi } from '../../lib/adminApi.js';
import { formatDate, formatNumber, formatPrice, localName } from '../../lib/format.js';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/icons.jsx';
import { DASHBOARD_KEY, AdminPageHeader } from './AdminLayout.jsx';

// Categorical slots 1–3 of the validated reference palette (blue, orange, aqua), in fixed order.
// Aqua is below 3:1 on white, so the chart has a legend, direct series names in the tooltip, and a table view.
const SERIES = { reports: '#2a78d6', reviews: '#eb6834', adminActions: '#1baf7a' };
const SINGLE = '#0D9488'; // single-series bars: brand teal that passes 3:1 on white
const GRID = '#E2E8F0';
const AXIS = '#64748B';

function StatCard({ label, value, icon, to, tone = 'text-navy', sub }) {
  const { lang } = useLang();
  const body = (
    <Card className="h-full transition hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon name={icon} className="h-5 w-5 text-primary-dark" />
      </div>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${tone}`}>{formatNumber(value, lang)}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
  return to ? <Link to={to} className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-primary">{body}</Link> : body;
}

function ChartTooltip({ active, payload, label, lang, labelFormatter, valueFormatter = (v) => formatNumber(v, lang) }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 text-xs text-slate-500">{labelFormatter ? labelFormatter(label) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-slate-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          {p.name}: <strong className="text-navy">{valueFormatter(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

function ActivityChart({ activity }) {
  const { t, lang } = useLang();
  const names = { reports: t('admin.dashboard.series.reports'), reviews: t('admin.dashboard.series.reviews'), adminActions: t('admin.dashboard.series.adminActions') };
  const fmtDay = (d) => formatDate(d, lang, { day: 'numeric', month: 'short' });
  return (
    <Card>
      <CardHeader title={t('admin.dashboard.activityTitle')} subtitle={t('admin.dashboard.activitySubtitle')} />
      <div className="h-64" role="img" aria-label={t('admin.dashboard.activityTitle')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activity} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fill: AXIS, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} minTickGap={16} />
            <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip lang={lang} labelFormatter={fmtDay} />} cursor={{ stroke: AXIS, strokeDasharray: '4 4' }} />
            <Legend iconType="circle" itemSorter={(item) => Object.keys(SERIES).indexOf(item.dataKey)} wrapperStyle={{ fontSize: 13, color: '#334155' }} formatter={(v) => <span style={{ color: '#334155' }}>{v}</span>} />
            {Object.entries(SERIES).map(([key, color]) => (
              <Line key={key} type="monotone" dataKey={key} name={names[key]} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-primary-dark">{t('history.showTable')}</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-1.5 pr-4">{t('history.date')}</th>
                {Object.keys(SERIES).map((k) => <th key={k} className="py-1.5 pr-4">{names[k]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activity.map((d) => (
                <tr key={d.day}>
                  <td className="py-1 pr-4">{fmtDay(d.day)}</td>
                  {Object.keys(SERIES).map((k) => <td key={k} className="py-1 pr-4 tabular-nums">{formatNumber(d[k], lang)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}

function CategoryChart({ data }) {
  const { t, lang } = useLang();
  const rows = data.map((c) => ({ name: localName(c, lang), prices: c.prices, avg: c.avgPrice }));
  return (
    <Card>
      <CardHeader title={t('admin.dashboard.byCategoryTitle')} subtitle={t('admin.dashboard.byCategorySubtitle')} />
      <div style={{ height: Math.max(220, rows.length * 34) }} role="img" aria-label={t('admin.dashboard.byCategoryTitle')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap={6}>
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(15,118,110,0.06)' }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
                    <p className="font-medium text-navy">{payload[0].payload.name}</p>
                    <p className="text-slate-600">{t('admin.dashboard.pricesCount', { n: formatNumber(payload[0].payload.prices, lang) })}</p>
                    {payload[0].payload.avg != null && <p className="text-slate-600">{t('admin.dashboard.avgPrice', { price: formatPrice(payload[0].payload.avg, lang) })}</p>}
                  </div>
                ) : null
              }
            />
            <Bar dataKey="prices" name={t('admin.fields.prices')} fill={SINGLE} radius={[0, 4, 4, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { t, lang } = useLang();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: DASHBOARD_KEY, queryFn: adminApi.dashboard });

  if (isError) return <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('admin.nav.dashboard')} description={t('admin.dashboard.description')} />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t('admin.dashboard.pendingReports')} value={data.totals.pendingReports} icon="message" to="/admin/price-reports" tone={data.totals.pendingReports ? 'text-coral-ink' : 'text-navy'} />
            <StatCard label={t('admin.dashboard.pendingReviews')} value={data.totals.pendingReviews} icon="star" to="/admin/reviews" tone={data.totals.pendingReviews ? 'text-coral-ink' : 'text-navy'} />
            <StatCard label={t('admin.dashboard.stalePrices', { days: data.staleDays })} value={data.totals.stalePrices} icon="alert" to="/admin/prices" tone={data.totals.stalePrices ? 'text-amber-700' : 'text-navy'} />
            <StatCard label={t('admin.dashboard.prices')} value={data.totals.prices} icon="tag" to="/admin/prices" />
            <StatCard label={t('admin.dashboard.labs')} value={data.totals.activeLabs} icon="building" to="/admin/labs" sub={t('admin.dashboard.hidden', { n: formatNumber(data.totals.hiddenLabs, lang) })} />
            <StatCard label={t('admin.dashboard.tests')} value={data.totals.activeTests} icon="flask" to="/admin/tests" sub={t('admin.dashboard.hidden', { n: formatNumber(data.totals.hiddenTests, lang) })} />
            <StatCard label={t('admin.dashboard.users')} value={data.totals.users} icon="users" to="/admin/users" sub={t('admin.dashboard.newThisWeek', { n: formatNumber(data.totals.newUsersWeek, lang) })} />
            <StatCard label={t('admin.dashboard.locations')} value={data.totals.cities} icon="mapPin" to="/admin/locations" sub={t('admin.dashboard.categoriesCount', { n: formatNumber(data.totals.categories, lang) })} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ActivityChart activity={data.activity} />
            <CategoryChart data={data.pricesByCategory} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title={t('admin.dashboard.oldestTitle')} subtitle={t('admin.dashboard.oldestSubtitle')} />
              <ul className="divide-y divide-slate-100">
                {data.oldestVerifiedLabs.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <Link to={`/labs/${l.slug}`} className="font-medium text-navy hover:text-primary-dark">{l.name}</Link>
                    <span className="text-right">
                      <span className="block text-amber-700">{formatDate(l.oldestVerifiedAt, lang)}</span>
                      <span className="text-xs text-slate-500">{t('admin.dashboard.staleOf', { stale: formatNumber(l.staleCount, lang), total: formatNumber(l.priceCount, lang) })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title={t('admin.dashboard.recentTitle')} />
              <ul className="divide-y divide-slate-100">
                {data.recentPrices.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-navy">{localName(p.test, lang)}</span>
                      <span className="text-xs text-slate-500">{p.lab.name} · {t(`admin.sources.${p.source}`)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums text-navy">{formatPrice(p.discountedPrice ?? p.price, lang)}</span>
                      <span className="text-xs text-slate-500">{formatDate(p.updatedAt, lang)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
