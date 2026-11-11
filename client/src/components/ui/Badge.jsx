import { cn } from '../../lib/cn.js';
import { Icon } from '../icons.jsx';

const VARIANTS = {
  teal: 'bg-primary/10 text-primary-dark ring-primary/20',
  coral: 'bg-coral-light text-coral-dark ring-coral/30',
  navy: 'bg-navy text-white ring-navy',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  white: 'bg-white/15 text-white ring-white/25',
};

export function Badge({ variant = 'slate', icon, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
