import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';
import { useLang } from '../hooks/useLang.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { usePopularTests, useStats } from '../hooks/queries.js';
import { useStoryScroll } from './landing/useStoryScroll.js';
import { StoryBackdrop } from './landing/StoryBackdrop.jsx';
import {
  CtaSection,
  HeroSection,
  PopularTestsSection,
  PriceGapSection,
  StatsSection,
  StepsSection,
  TrustSection,
} from './landing/sections.jsx';

/**
 * Landing page.
 * The first three sections are the "scroll story". A sticky 3D canvas (or the 2D fallback) sits behind them,
 * and its camera moves as the user scrolls. All text is plain HTML, so it shows first and search engines can read it.
 */
export default function HomePage() {
  const { t } = useLang();
  usePageMeta({ title: t('landing.meta.title'), description: t('landing.meta.description') });

  const popular = usePopularTests(8);
  const stats = useStats();
  const { wrapperRef, progressRef, pointerRef } = useStoryScroll();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div ref={wrapperRef} className="relative -mt-16 bg-navy">
          <div className="sticky top-0 h-dvh w-full overflow-hidden" aria-hidden="true">
            <StoryBackdrop wrapperRef={wrapperRef} progressRef={progressRef} pointerRef={pointerRef} />
          </div>
          <div className="relative -mt-[100dvh]">
            <HeroSection popular={popular.data} />
            <PriceGapSection popular={popular.data} loading={popular.isPending} />
            <StepsSection />
          </div>
        </div>
        <PopularTestsSection popular={popular.data} loading={popular.isPending} />
        <StatsSection stats={stats.data} />
        <TrustSection stats={stats.data} />
        <CtaSection />
      </MotionConfig>
    </LazyMotion>
  );
}
