import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLang } from '../../hooks/useLang.js';
import { usePriceHistory } from '../../hooks/queries.js';
import { formatDate, formatNumber, formatPrice } from '../../lib/format.js';
import { Select } from '../ui/Select.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

// One series, so no legend: the title names it. #0D9488 is a brand teal that passes the 3:1 contrast and chroma
// checks on white (the lighter #14B8A6 does not). Text uses slate ink, never the series colour.
const SERIES = '#0D9488';
const GRID = '#E2E8F0';
const AXIS_TEXT = '#64748B';

/** A round step (1, 2 or 5 times a power of ten) near `raw`. */
function niceStep(raw) {
  const power = 10 ** Math.floor(Math.log10(raw));
  const m = raw / power;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * power;
}

/** About 4 to 6 round y-axis ticks around the data, never below 0. */
export function niceTicks(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, max * 0.1, 1);
  const step = niceStep(span / 4);
  const lo = Math.max(0, Math.floor((min - step / 2) / step) * step);
  const hi = Math.ceil((max + step / 2) / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

/** Turns price changes into a step series that runs on to today. */
function toSeries(points) {
  const series = points.map((p) => ({ t: new Date(p.changedAt).getTime(), price: p.newPrice }));
  if (series.length) series.push({ t: Date.now(), price: series.at(-1).price, isNow: true });
  return series;
}

function ChartTooltip({ active, payload, lang, t }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-slate-500">{point.isNow ? t('history.today') : formatDate(point.t, lang)}</p>
      <p className="font-semibold text-navy">{formatPrice(point.price, lang)}</p>
    </div>
  );
}

/** Price history of one lab for one test (Recharts step line). `labs` fills the lab picker. */
export function PriceHistoryChart({ slug, labs, defaultLabId }) {
  const { t, lang } = useLang();
  const [labId, setLabId] = useState(defaultLabId);
  const activeLabId = labId ?? defaultLabId;
  const { data, isPending, isError } = usePriceHistory(slug, activeLabId);
  const series = useMemo(() => toSeries(data?.points ?? []), [data]);
  const yTicks = useMemo(() => (series.length ? niceTicks(series.map((p) => p.price)) : []), [series]);
  const changes = (data?.points ?? []).filter((p) => p.oldPrice != null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-navy">{t('history.title')}</h2>
          <p className="text-sm text-slate-500">{t('history.subtitle')}</p>
        </div>
        {labs?.length > 0 && (
          <Select
            label={t('history.lab')}
            value={activeLabId ?? ''}
            onChange={(e) => setLabId(Number(e.target.value))}
            options={labs.map((l) => ({ value: l.id, label: l.name }))}
            className="w-56"
          />
        )}
      </div>

      {isPending && <Skeleton className="h-64 w-full rounded-xl" />}
      {isError && <EmptyState compact icon="alert" title={t('errors.loadFailed')} />}
      {!isPending && !isError && series.length === 0 && <EmptyState compact icon="chart" title={t('history.empty')} />}
      {!isPending && !isError && series.length > 0 && (
        <>
          <div className="h-64 w-full" role="img" aria-label={t('history.chartLabel', { count: data.points.length })}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(v) => formatDate(v, lang, { month: 'short', year: '2-digit' })}
                  tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                  axisLine={{ stroke: GRID }}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  dataKey="price"
                  tickFormatter={(v) => formatPrice(v, lang)}
                  tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  domain={[yTicks[0], yTicks.at(-1)]}
                  ticks={yTicks}
                />
                <Tooltip
                  content={<ChartTooltip lang={lang} t={t} />}
                  cursor={{ stroke: AXIS_TEXT, strokeDasharray: '4 4', strokeWidth: 1 }}
                />
                <Line
                  type="stepAfter"
                  dataKey="price"
                  stroke={SERIES}
                  strokeWidth={2}
                  dot={(props) => (props.payload.isNow ? <g key={props.key} /> : <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill={SERIES} stroke="#fff" strokeWidth={2} />)}
                  activeDot={{ r: 6, fill: SERIES, stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* The same data as a table, for screen readers and anyone who prefers numbers. */}
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-primary-dark">{t('history.showTable')}</summary>
            <table className="mt-2 w-full text-left">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-1.5">{t('history.date')}</th>
                  <th className="py-1.5">{t('history.oldPrice')}</th>
                  <th className="py-1.5">{t('history.newPrice')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.points.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5">{formatDate(p.changedAt, lang)}</td>
                    <td className="py-1.5 text-slate-500">{p.oldPrice == null ? t('history.firstPrice') : formatPrice(p.oldPrice, lang)}</td>
                    <td className="py-1.5 font-medium text-navy">{formatPrice(p.newPrice, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <p className="mt-2 text-xs text-slate-500">{t('history.changes', { count: changes.length, n: formatNumber(changes.length, lang) })}</p>
        </>
      )}
    </div>
  );
}
