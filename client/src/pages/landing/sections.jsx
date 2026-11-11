import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { useLang } from '../../hooks/useLang.js';
import { useInView } from '../../hooks/useInView.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { formatDate, formatNumber, formatPrice, localName } from '../../lib/format.js';
import { SearchBar } from '../../components/SearchBar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { Icon } from '../../components/icons.jsx';
import { Disclaimer } from '../../components/layout/Footer.jsx';
import { useBasket } from '../../context/BasketContext.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

const inViewProps = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.3 }, variants: fadeUp };

// ---------- 1. Hero ----------

export function HeroSection({ popular }) {
  const { t, lang } = useLang();
  return (
    <section className="flex min-h-dvh items-center px-4 pb-16 pt-28 sm:px-6" aria-labelledby="hero-title">
      <div className="mx-auto w-full max-w-3xl text-center">
        {/* The headline and search bar are not animated, so they are the first paint (good for LCP). */}
        <div className="motion-safe:animate-fade-up">
          <Badge variant="white" icon="sparkle" className="mb-5">{t('landing.hero.badge')}</Badge>
        </div>
        <h1 id="hero-title" className="text-balance text-4xl font-bold leading-tight text-white sm:text-6xl">
          {t('landing.hero.title1')} <span className="text-primary-light">{t('landing.hero.title2')}</span>{' '}
          <span className="text-coral">{t('landing.hero.title3')}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">{t('landing.hero.subtitle')}</p>
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar size="lg" dark />
        </div>
        {popular?.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 motion-safe:animate-fade-up">
            <span className="text-sm text-slate-400">{t('landing.hero.popular')}</span>
            {popular.slice(0, 4).map((test) => (
              <Link
                key={test.id}
                to={`/tests/${test.slug}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:border-primary-light hover:text-white"
              >
                {localName(test, lang)}
              </Link>
            ))}
          </div>
        )}
        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Icon name="chevronDown" className="h-4 w-4 motion-safe:animate-bounce" />
          {t('landing.hero.scroll')}
        </p>
      </div>
    </section>
  );
}

// ---------- 2. The same test, different prices ----------

function pickExample(popular) {
  if (!popular?.length) return null;
  return [...popular].filter((p) => p.labCount > 1).sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice))[0] || popular[0];
}

export function PriceGapSection({ popular, loading }) {
  const { t, lang } = useLang();
  const example = pickExample(popular);
  const saving = example ? example.maxPrice - example.minPrice : 0;
  const ratio = example ? Math.max(0.12, example.minPrice / example.maxPrice) : 0.5;

  return (
    <section className="flex min-h-dvh items-center px-4 py-20 sm:px-6" aria-labelledby="gap-title">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <m.div {...inViewProps}>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-light">{t('landing.gap.eyebrow')}</p>
          <h2 id="gap-title" className="mt-3 text-balance text-3xl font-bold text-white sm:text-5xl">{t('landing.gap.title')}</h2>
          <p className="mt-4 max-w-md text-lg text-slate-300">{t('landing.gap.text')}</p>
        </m.div>

        <m.div {...inViewProps} custom={1} className="rounded-3xl border border-white/10 bg-navy/60 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {loading || !example ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-2/3 bg-white/10" />
              <Skeleton className="h-10 w-full bg-white/10" />
              <Skeleton className="h-10 w-3/4 bg-white/10" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">{t('landing.gap.liveExample')}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{localName(example, lang)}</h3>
                  <p className="text-sm text-slate-400">{t('landing.gap.acrossLabs', { count: example.labCount, n: formatNumber(example.labCount, lang) })}</p>
                </div>
                <Badge variant="coral" className="text-sm">{t('price.save', { amount: formatPrice(saving, lang) })}</Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-primary-light">{t('landing.gap.cheapest')}</span>
                    <span className="font-bold text-white">{formatPrice(example.minPrice, lang)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <m.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${ratio * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-coral">{t('landing.gap.mostExpensive')}</span>
                    <span className="font-bold text-white">{formatPrice(example.maxPrice, lang)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <m.div
                      className="h-full rounded-full bg-coral"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              <Button to={`/tests/${example.slug}`} variant="primary" className="mt-7 w-full sm:w-auto">
                {t('landing.gap.compareCta')} <Icon name="arrowRight" className="h-4 w-4" />
              </Button>
              <p className="mt-4 text-xs text-slate-400">{t('landing.gap.sampleNote')}</p>
            </>
          )}
        </m.div>
      </div>
    </section>
  );
}

// ---------- 3. Search, compare, save ----------

const STEPS = [
  { key: 'search', icon: 'search', color: 'bg-primary/20 text-primary-light' },
  { key: 'compare', icon: 'chart', color: 'bg-white/15 text-white' },
  { key: 'save', icon: 'tag', color: 'bg-coral/20 text-coral' },
];

export function StepsSection() {
  const { t, lang } = useLang();
  return (
    <section className="flex min-h-dvh items-center px-4 py-20 sm:px-6" aria-labelledby="steps-title">
      <div className="mx-auto w-full max-w-6xl">
        <m.div {...inViewProps} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-light">{t('landing.steps.eyebrow')}</p>
          <h2 id="steps-title" className="mt-3 text-3xl font-bold text-white sm:text-5xl">{t('landing.steps.title')}</h2>
        </m.div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <m.li
              key={step.key}
              {...inViewProps}
              custom={i + 1}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-navy/60 p-7 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}>
                  <Icon name={step.icon} className="h-7 w-7" />
                </span>
                <span className="text-5xl font-bold text-white/10">{formatNumber(i + 1, lang)}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{t(`landing.steps.${step.key}.title`)}</h3>
              <p className="mt-2 text-slate-300">{t(`landing.steps.${step.key}.text`)}</p>
            </m.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------- 4. Popular tests ----------

export function PopularTestCard({ test }) {
  const { t, lang } = useLang();
  const basket = useBasket();
  const inBasket = basket.has(test.id);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-xl">
      <p className="text-xs font-medium text-primary-dark">{localName(test.category, lang)}</p>
      <h3 className="mt-1 font-semibold text-navy">
        <Link to={`/tests/${test.slug}`} className="after:absolute after:inset-0">
          {localName(test, lang)}
        </Link>
      </h3>
      <p className="mt-0.5 text-xs text-slate-500">{lang === 'bn' ? test.nameEn : test.nameBn}</p>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500">{t('landing.popular.from')}</p>
          <p className="text-2xl font-bold text-navy">{formatPrice(test.minPrice, lang)}</p>
        </div>
        {test.maxPrice > test.minPrice && (
          <Badge variant="coral">{t('price.save', { amount: formatPrice(test.maxPrice - test.minPrice, lang) })}</Badge>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">{t('landing.popular.labs', { count: test.labCount, n: formatNumber(test.labCount, lang) })}</span>
        <button
          type="button"
          onClick={() => basket.toggle(test)}
          aria-pressed={inBasket}
          className="relative z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-primary-dark hover:bg-mint"
        >
          <Icon name={inBasket ? 'check' : 'plus'} className="h-4 w-4" />
          {inBasket ? t('landing.popular.inBasket') : t('landing.popular.addToBasket')}
        </button>
      </div>
    </article>
  );
}

export function PopularTestsSection({ popular, loading }) {
  const { t } = useLang();
  return (
    <section className="bg-mint px-4 py-20 sm:px-6" aria-labelledby="popular-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="popular-title" className="text-3xl font-bold text-navy">{t('landing.popular.title')}</h2>
            <p className="mt-2 text-slate-600">{t('landing.popular.subtitle')}</p>
          </div>
          <Button to="/tests" variant="secondary">
            {t('landing.popular.viewAll')} <Icon name="arrowRight" className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            : popular?.map((test) => <PopularTestCard key={test.id} test={test} />)}
        </div>
      </div>
    </section>
  );
}

// ---------- 5. Live stats ----------

function Stat({ value, label, icon, start }) {
  const { lang } = useLang();
  const count = useCountUp(value, { start });
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-card">
      <Icon name={icon} className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-3 text-4xl font-bold tabular-nums text-navy">
        <span className="sr-only">{formatNumber(value, lang)}</span>
        <span aria-hidden="true">{formatNumber(count, lang)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

export function StatsSection({ stats }) {
  const { t } = useLang();
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <section ref={ref} className="bg-white px-4 py-20 sm:px-6" aria-labelledby="stats-title">
      <div className="mx-auto max-w-5xl">
        <h2 id="stats-title" className="text-center text-3xl font-bold text-navy">{t('landing.stats.title')}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Stat value={stats?.labs ?? 0} label={t('landing.stats.labs')} icon="building" start={inView && !!stats} />
          <Stat value={stats?.tests ?? 0} label={t('landing.stats.tests')} icon="flask" start={inView && !!stats} />
          <Stat value={stats?.verifiedPrices ?? 0} label={t('landing.stats.verified')} icon="checkCircle" start={inView && !!stats} />
        </div>
      </div>
    </section>
  );
}

// ---------- 6. Trust ----------

export function TrustSection({ stats }) {
  const { t, lang } = useLang();
  const points = ['admin', 'reports', 'dates'];
  return (
    <section className="bg-mint px-4 py-20 sm:px-6" aria-labelledby="trust-title">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 id="trust-title" className="text-3xl font-bold text-navy">{t('landing.trust.title')}</h2>
          <p className="mt-3 text-slate-600">{t('landing.trust.text')}</p>
          {stats?.lastVerifiedAt && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm">
              <Icon name="checkCircle" className="h-4 w-4 text-primary" />
              {t('landing.trust.lastCheck', { date: formatDate(stats.lastVerifiedAt, lang) })}
            </p>
          )}
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <Disclaimer />
          </div>
        </div>
        <ul className="grid gap-4">
          {points.map((key, i) => (
            <m.li key={key} {...inViewProps} custom={i} className="flex gap-4 rounded-2xl bg-white p-5 shadow-card">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                <Icon name={['shield', 'users', 'clock'][i]} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold text-navy">{t(`landing.trust.${key}.title`)}</h3>
                <p className="mt-1 text-sm text-slate-600">{t(`landing.trust.${key}.text`)}</p>
              </div>
            </m.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- 7. Call to action ----------

export function CtaSection() {
  const { t } = useLang();
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <m.div
        {...inViewProps}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-navy px-6 py-12 text-center sm:px-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.35),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,107,87,0.35),transparent_50%)]" aria-hidden="true" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('landing.cta.title')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">{t('landing.cta.text')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/tests" variant="coral" size="lg">{t('landing.cta.compare')}</Button>
            <Button to="/report-price" variant="secondary" size="lg">{t('landing.cta.report')}</Button>
          </div>
        </div>
      </m.div>
    </section>
  );
}
