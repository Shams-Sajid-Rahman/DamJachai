import { cn } from '../../lib/cn.js';

export function Card({ as: Tag = 'div', className, padded = true, children, ...props }) {
  return (
    <Tag className={cn('rounded-2xl border border-slate-100 bg-white shadow-card', padded && 'p-5 sm:p-6', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
