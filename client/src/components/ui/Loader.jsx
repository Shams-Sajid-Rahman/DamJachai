import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn.js';

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' };

export function Loader({ size = 'md', label, className = '' }) {
  const { t } = useTranslation();
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn('animate-spin rounded-full border-primary/30 border-t-primary', SIZES[size])}
        aria-hidden="true"
      />
      <span className={label ? 'text-sm text-slate-600' : 'sr-only'}>{label || t('common.loading')}</span>
    </span>
  );
}
