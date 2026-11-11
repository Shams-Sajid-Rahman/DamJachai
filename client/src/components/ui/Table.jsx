import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn.js';
import { Icon } from '../icons.jsx';
import { Skeleton } from './Skeleton.jsx';
import { EmptyState } from './EmptyState.jsx';

/**
 * Data table.
 * columns: [{ key, header, render?(row), className?, sortKey? }]
 * sort: { key, order } and onSort(key) make sortable headers.
 */
export function Table({
  columns,
  rows = [],
  rowKey = (row) => row.id,
  loading = false,
  skeletonRows = 6,
  empty,
  sort,
  onSort,
  rowClassName,
  caption,
  className,
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card', className)}>
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => {
              const active = sort && col.sortKey && sort.key === col.sortKey;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cn('whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500', col.headerClassName)}
                >
                  {col.sortKey && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.sortKey)}
                      className="inline-flex items-center gap-1 uppercase hover:text-navy"
                    >
                      {col.header}
                      <Icon
                        name="chevronDown"
                        className={cn('h-3.5 w-3.5 transition', active ? 'opacity-100' : 'opacity-30', active && sort.order === 'asc' && 'rotate-180')}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`sk-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <Skeleton className="h-4 w-full max-w-[10rem]" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading &&
            rows.map((row, index) => (
              <tr key={rowKey(row)} className={cn('transition-colors hover:bg-slate-50/70', rowClassName?.(row, index))}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 align-middle text-slate-700', col.className)}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (empty || <EmptyState compact title={t('common.noResults')} />)}
    </div>
  );
}
