import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { getErrorMessage, getFieldErrors } from '../../lib/errors.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { AuthCard } from './AuthCard.jsx';

function validate(form, t) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = t('validation.nameMin');
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = t('validation.email');
  if (form.password.length < 8) errors.password = t('validation.passwordMin');
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errors.password = t('validation.passwordMix');
  if (form.confirm !== form.password) errors.confirm = t('validation.passwordMatch');
  return errors;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  usePageMeta({ title: t('auth.registerTitle') });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const clientErrors = validate(form, t);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" state={location.state} className="font-semibold text-primary-dark hover:underline">
            {t('auth.loginLink')}
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
        <Input label={t('auth.name')} name="name" autoComplete="name" required value={form.name} onChange={onChange} error={errors.name} />
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
          autoComplete="new-password"
          required
          hint={t('auth.passwordHint')}
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />
        <Input
          label={t('auth.confirmPassword')}
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={onChange}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {t('auth.registerButton')}
        </Button>
      </form>
    </AuthCard>
  );
}
