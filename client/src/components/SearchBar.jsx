import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '../hooks/useLang.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { publicApi } from '../lib/publicApi.js';
import { formatPrice, localName } from '../lib/format.js';
import { cn } from '../lib/cn.js';
import { Icon } from './icons.jsx';

/**
 * Test search with live suggestions (ARIA combobox pattern).
 * - Typing shows up to 6 matching tests (Bangla, English or alias).
 * - Arrow keys move through suggestions, Enter opens one, Escape closes the list.
 * - Submitting without a selection goes to /tests?q=...
 */
export function SearchBar({ size = 'md', defaultValue = '', autoFocus = false, placeholder, onSearch, className, dark = false }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const listId = useId();
  const wrapperRef = useRef(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const q = useDebounce(value.trim(), 220);

  useEffect(() => setValue(defaultValue), [defaultValue]);
  useClickOutside(wrapperRef, () => setOpen(false), open);

  const { data, isFetching } = useQuery({
    queryKey: ['suggest', q],
    queryFn: () => publicApi.searchTests({ q, limit: 6 }),
    enabled: q.length >= 2,
    staleTime: 60_000,
  });
  const suggestions = q.length >= 2 ? data?.data ?? [] : [];

  function go(path) {
    setOpen(false);
    setActive(-1);
    navigate(path);
  }

  function submit(e) {
    e.preventDefault();
    if (active >= 0 && suggestions[active]) return go(`/tests/${suggestions[active].slug}`);
    const query = value.trim();
    if (onSearch) {
      setOpen(false);
      return onSearch(query);
    }
    return go(query ? `/tests?q=${encodeURIComponent(query)}` : '/tests');
  }

  function onKeyDown(e) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  const large = size === 'lg';
  const showList = open && q.length >= 2;

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={`${listId}-input`} className="sr-only">
          {t('search.label')}
        </label>
        <Icon
          name="search"
          className={cn('pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400', large ? 'h-6 w-6' : 'h-5 w-5')}
        />
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder || t('search.placeholder')}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full rounded-2xl border bg-white text-slate-800 shadow-lg outline-none transition placeholder:text-slate-400',
            'focus:border-primary focus:ring-4 focus:ring-primary/25',
            dark ? 'border-white/20' : 'border-slate-200',
            large ? 'h-16 pl-14 pr-32 text-lg' : 'h-12 pl-12 pr-28 text-base',
          )}
        />
        <button
          type="submit"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-coral font-semibold text-white shadow-sm transition hover:bg-coral-dark',
            large ? 'h-12 px-6 text-base' : 'h-9 px-4 text-sm',
          )}
        >
          {t('search.button')}
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('search.suggestions')}
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[22rem] overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 text-left shadow-2xl"
        >
          {isFetching && !suggestions.length && <li className="px-4 py-3 text-sm text-slate-500">{t('common.loading')}</li>}
          {!isFetching && !suggestions.length && (
            <li className="px-4 py-3 text-sm text-slate-500">{t('search.noSuggestions', { q })}</li>
          )}
          {suggestions.map((test, i) => (
            <li
              key={test.id}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(`/tests/${test.slug}`)}
              onMouseEnter={() => setActive(i)}
              className={cn('flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5', i === active && 'bg-mint')}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-navy">{localName(test, lang)}</span>
                <span className="block truncate text-xs text-slate-500">
                  {lang === 'bn' ? test.nameEn : test.nameBn} · {localName(test.category, lang)}
                </span>
              </span>
              {test.minPrice != null && (
                <span className="shrink-0 text-sm font-semibold text-primary-dark">
                  {t('price.from', { price: formatPrice(test.minPrice, lang) })}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
