import { useLang } from '../hooks/useLang.js';
import { useCities } from '../hooks/queries.js';
import { localName } from '../lib/format.js';
import { Select } from './ui/Select.jsx';

/** City and area dropdowns. The area list depends on the chosen city. Values are slugs. */
export function LocationFilters({ city, area, onChange, className = '' }) {
  const { t, lang } = useLang();
  const { data: cities = [] } = useCities();
  const selectedCity = cities.find((c) => c.slug === city);

  return (
    <>
      <Select
        label={t('filters.city')}
        value={city || ''}
        onChange={(e) => onChange({ city: e.target.value, area: '' })}
        placeholder={t('filters.allCities')}
        options={cities.map((c) => ({ value: c.slug, label: localName(c, lang) }))}
        className={className}
      />
      <Select
        label={t('filters.area')}
        value={area || ''}
        onChange={(e) => onChange({ area: e.target.value })}
        placeholder={selectedCity ? t('filters.allAreas') : t('filters.pickCityFirst')}
        disabled={!selectedCity}
        options={(selectedCity?.areas || []).map((a) => ({ value: a.slug, label: localName(a, lang) }))}
        className={className}
      />
    </>
  );
}
