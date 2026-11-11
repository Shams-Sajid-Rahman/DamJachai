import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const BasketContext = createContext(null);
const STORAGE_KEY = 'damjachai_basket';
export const BASKET_MAX = 25;

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((t) => Number.isInteger(t?.id)).slice(0, BASKET_MAX) : [];
  } catch {
    return [];
  }
}

/** The test basket, saved in localStorage. Stores { id, slug, nameEn, nameBn } for each test. */
export function BasketProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage can be full or blocked (private mode); the basket still works for this visit
    }
  }, [items]);

  const add = useCallback((test) => {
    setItems((list) =>
      list.some((t) => t.id === test.id) || list.length >= BASKET_MAX
        ? list
        : [...list, { id: test.id, slug: test.slug, nameEn: test.nameEn, nameBn: test.nameBn }],
    );
  }, []);
  const remove = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id) => items.some((t) => t.id === id), [items]);
  const toggle = useCallback((test) => (items.some((t) => t.id === test.id) ? remove(test.id) : add(test)), [items, add, remove]);

  const value = useMemo(() => ({ items, count: items.length, add, remove, clear, has, toggle, isFull: items.length >= BASKET_MAX }), [items, add, remove, clear, has, toggle]);
  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside <BasketProvider>');
  return ctx;
}
