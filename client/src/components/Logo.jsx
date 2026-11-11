import { LogoIcon } from './LogoIcon.jsx';

/**
 * Brand logo: price-tag icon, "দাম যাচাই" and "DamJachai" below it.
 * variant "light" is for dark backgrounds (navy hero and footer).
 */
export function Logo({ variant = 'dark', className = '' }) {
  const titleColor = variant === 'light' ? 'text-white' : 'text-navy';
  const subColor = variant === 'light' ? 'text-primary-light' : 'text-primary-dark';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoIcon className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span lang="bn" className={`font-bangla text-xl font-bold ${titleColor}`}>
          দাম যাচাই
        </span>
        <span className={`font-sans text-[11px] font-semibold uppercase tracking-[0.18em] ${subColor}`}>
          DamJachai
        </span>
      </span>
    </span>
  );
}
