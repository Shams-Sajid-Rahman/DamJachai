import { lazy, Suspense, useEffect, useState } from 'react';
import { detectDeviceTier } from '../../lib/deviceTier.js';
import { cn } from '../../lib/cn.js';

// three.js is a big download, so it is only fetched when it is going to be used.
const HeroScene = lazy(() => import('./scene/HeroScene.jsx'));

/** 2D fallback: layered gradients and soft blobs. It is also what shows while the 3D loads. */
export function GradientBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,107,87,0.28),transparent_55%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl motion-safe:animate-[float_9s_ease-in-out_infinite]" />
      <div className="absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-coral/20 blur-3xl motion-safe:animate-[float_11s_ease-in-out_infinite_reverse]" />
      <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-primary-light/10 blur-2xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </div>
  );
}

/**
 * Background of the scroll story. It chooses between 3D and the 2D fallback.
 * - Weak devices, no WebGL or Save-Data: 2D only.
 * - Small screens: 2D first, then lite 3D after the first interaction, so the first paint stays fast on phones.
 * - Larger screens: 3D loads when the browser is idle after the page has loaded.
 * - The render loop pauses when the story is off screen or the tab is hidden.
 */
export function StoryBackdrop({ wrapperRef, progressRef, pointerRef }) {
  const [device, setDevice] = useState(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(!document.hidden);

  useEffect(() => setDevice(detectDeviceTier()), []);

  useEffect(() => {
    if (!device || device.tier === 'fallback') return undefined;

    if (device.smallScreen) {
      const events = ['pointerdown', 'touchstart', 'scroll', 'keydown'];
      const start = () => {
        setShouldLoad(true);
        events.forEach((e) => window.removeEventListener(e, start));
      };
      events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
      return () => events.forEach((e) => window.removeEventListener(e, start));
    }

    let idleId;
    let timeoutId;
    const schedule = () => {
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(() => setShouldLoad(true), { timeout: 2500 });
      else timeoutId = setTimeout(() => setShouldLoad(true), 1200);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [device]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [wrapperRef]);

  return (
    <div className="absolute inset-0" data-tier={device?.tier ?? 'pending'}>
      <GradientBackdrop />
      {shouldLoad && device && device.tier !== 'fallback' && (
        <div className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
          <Suspense fallback={null}>
            <HeroScene
              tier={device.tier}
              reducedMotion={device.reducedMotion}
              paused={!onScreen || !tabVisible}
              progressRef={progressRef}
              pointerRef={pointerRef}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
