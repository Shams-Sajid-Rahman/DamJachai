import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Filters kept in the URL query string, so results can be shared and survive a reload.
 * `defaults` lists the known keys. Values equal to the default are left out of the URL.
 * Changing any filter other than `page` resets page to 1.
 */
export function useUrlState(defaults) {
  const [params, setParams] = useSearchParams();

  const state = useMemo(() => {
    const out = {};
    for (const [key, def] of Object.entries(defaults)) {
      const raw = params.get(key);
      if (raw === null) out[key] = def;
      else if (typeof def === 'number') out[key] = Number(raw) || def;
      else if (typeof def === 'boolean') out[key] = raw === 'true';
      else out[key] = raw;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const update = useCallback(
    (changes) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const touchesFilters = Object.keys(changes).some((k) => k !== 'page');
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === null || value === '' || value === defaults[key] || value === false) next.delete(key);
            else next.set(key, String(value));
          }
          if (touchesFilters && !('page' in changes)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setParams],
  );

  return [state, update];
}
