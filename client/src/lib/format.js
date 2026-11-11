// Locale-aware formatting. Bangla uses Bengali digits (৳ ১,২০০) through Intl 'bn-BD'.

export const STALE_DAYS = 90;

const localeOf = (lang) => (lang === 'bn' ? 'bn-BD' : 'en-IN'); // en-IN groups like BD prices: 1,20,000

const numberFormats = new Map();
function numberFormat(lang, options = {}) {
  const key = `${lang}:${JSON.stringify(options)}`;
  if (!numberFormats.has(key)) numberFormats.set(key, new Intl.NumberFormat(localeOf(lang), options));
  return numberFormats.get(key);
}

export function formatNumber(value, lang = 'en', options) {
  if (value == null || Number.isNaN(Number(value))) return '';
  return numberFormat(lang, options).format(Number(value));
}

/** ৳1,200 (en) or ৳১,২০০ (bn). Whole taka, unless the value has paisa. */
export function formatPrice(value, lang = 'en') {
  if (value == null) return '';
  const n = Number(value);
  const hasFraction = Math.round(n * 100) % 100 !== 0;
  return `৳${formatNumber(n, lang, { minimumFractionDigits: hasFraction ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(value, lang = 'en', options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', options).format(date);
}

export function daysSince(value, now = Date.now()) {
  if (!value) return null;
  return Math.max(0, Math.floor((now - new Date(value).getTime()) / 86_400_000));
}

export const isStale = (value, days = STALE_DAYS) => {
  const d = daysSince(value);
  return d != null && d > days;
};

/** "3 days ago" or "৩ দিন আগে". */
export function timeAgo(value, lang = 'en') {
  const days = daysSince(value);
  if (days == null) return '';
  const rtf = new Intl.RelativeTimeFormat(lang === 'bn' ? 'bn-BD' : 'en', { numeric: 'auto' });
  if (days < 1) return rtf.format(0, 'day');
  if (days < 30) return rtf.format(-days, 'day');
  if (days < 365) return rtf.format(-Math.floor(days / 30), 'month');
  return rtf.format(-Math.floor(days / 365), 'year');
}

/** Report time: under 48 hours is shown in hours, otherwise in days. Returns { value, unit } for i18n. */
export function reportTime(hours) {
  if (hours == null) return null;
  if (hours < 48) return { value: hours, unit: 'hours' };
  return { value: Math.round(hours / 24), unit: 'days' };
}

/** Picks the Bangla or English field of an object: localName(test, 'bn') -> test.nameBn. */
export function localName(entity, lang, field = 'name') {
  if (!entity) return '';
  const bn = entity[`${field}Bn`];
  const en = entity[`${field}En`];
  return (lang === 'bn' ? bn || en : en || bn) ?? entity[field] ?? '';
}
