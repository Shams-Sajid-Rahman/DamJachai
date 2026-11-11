import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../hooks/useLang.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToggleFavorite } from '../hooks/queries.js';
import { useToast } from './ui/Toast.jsx';
import { getErrorMessage } from '../lib/errors.js';
import { cn } from '../lib/cn.js';
import { Icon } from './icons.jsx';

/** Heart toggle. A guest is sent to the login page and comes back afterwards. */
export function FavoriteButton({ labId, isFavorite, className }) {
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const toggle = useToggleFavorite();

  function onClick() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    toggle.mutate(
      { labId, isFavorite },
      {
        onSuccess: () => toast.success(isFavorite ? t('favorites.removed') : t('favorites.added')),
        onError: (err) => toast.error(getErrorMessage(err, t)),
      },
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!isFavorite}
      disabled={toggle.isPending}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition',
        isFavorite ? 'border-coral/40 bg-coral-light text-coral-ink' : 'border-slate-300 bg-white text-navy hover:border-coral hover:text-coral-ink',
        className,
      )}
    >
      <Icon name="heart" filled={!!isFavorite} className="h-5 w-5" />
      {isFavorite ? t('favorites.saved') : t('favorites.save')}
    </button>
  );
}
