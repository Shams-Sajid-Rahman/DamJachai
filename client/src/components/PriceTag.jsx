import { useLang } from '../hooks/useLang.js';
import { formatPrice } from '../lib/format.js';
import { cn } from '../lib/cn.js';

const SIZES = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl sm:text-3xl' };

/** The price a user pays. When there is a discount, the original price is shown struck through. */
export function PriceTag({ price, discountedPrice, size = 'md', highlight = false, prefix, className }) {
  const { t, lang } = useLang();
  const hasDiscount = discountedPrice != null && discountedPrice < price;
  const effective = hasDiscount ? discountedPrice : price;

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      {prefix && <span className="text-sm font-medium text-slate-500">{prefix}</span>}
      <span className={cn('font-bold tabular-nums', SIZES[size], highlight ? 'text-coral-ink' : 'text-navy')}>
        {formatPrice(effective, lang)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-slate-500 line-through" aria-label={t('price.original', { price: formatPrice(price, lang) })}>
          {formatPrice(price, lang)}
        </span>
      )}
    </span>
  );
}
