import { cn } from '../../lib/cn.js';

/** A mint page header band with a title, subtitle and optional actions or children (e.g. a search bar). */
export function PageHeader({ title, subtitle, eyebrow, actions, children, className }) {
  return (
    <section className={cn('border-b border-primary/10 bg-gradient-to-b from-white to-mint', className)}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <p className="mb-1 text-sm font-semibold text-primary-dark">{eyebrow}</p>}
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

export function Container({ className, children }) {
  return <div className={cn('mx-auto max-w-7xl px-4 sm:px-6', className)}>{children}</div>;
}
