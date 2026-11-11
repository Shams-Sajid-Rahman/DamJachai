import { cn } from '../../lib/cn.js';
import { Icon } from '../icons.jsx';

export function EmptyState({ icon = 'search', title, description, action, compact = false, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-10' : 'px-6 py-16', className)}>
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-primary-dark">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
