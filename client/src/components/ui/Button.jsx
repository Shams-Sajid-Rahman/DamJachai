import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

const VARIANTS = {
  primary: 'bg-primary-dark text-white hover:bg-[#115E59] shadow-sm',
  coral: 'bg-coral text-navy hover:bg-[#ff8270] shadow-sm',
  navy: 'bg-navy text-white hover:bg-navy-light shadow-sm',
  secondary: 'bg-white text-navy border border-slate-300 hover:border-primary hover:text-primary-dark',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  link: 'bg-transparent p-0 text-primary-dark underline-offset-4 hover:underline',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
};

/**
 * Button. Pass `to` to render a router Link, or `href` for a plain <a>.
 * `loading` shows a spinner and disables the button.
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, to, href, type = 'button', ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    VARIANTS[variant],
    variant !== 'link' && SIZES[size],
    className,
  );

  const content = (
    <>
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...props}>
      {content}
    </button>
  );
});
