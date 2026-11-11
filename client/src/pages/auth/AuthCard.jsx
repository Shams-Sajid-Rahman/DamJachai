import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo.jsx';

/** Centered card used by the login and register pages. */
export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="DamJachai home">
            <Logo />
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold text-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}
