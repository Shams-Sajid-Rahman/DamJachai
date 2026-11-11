import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { getErrorMessage, getFieldErrors } from '../../lib/errors.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { AuthCard } from './AuthCard.jsx';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  usePageMeta({ title: t('auth.loginTitle'), noindex: true });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    setFormError('');
    setSubmitting(true);
    try {
      const user = await login(form);
      const fallback = user.role === 'admin' ? '/admin' : '/';
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/register" state={location.state} className="font-semibold text-primary-dark hover:underline">
            {t('auth.registerLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <Input
          label={t('auth.email')}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={form.email}
          onChange={onChange}
          error={errors.email}
        />
        <Input
          label={t('auth.password')}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {t('auth.loginButton')}
        </Button>
      </form>
    </AuthCard>
  );
}
