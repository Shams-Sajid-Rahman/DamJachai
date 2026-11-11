import { useEffect, useRef } from 'react';

/**
 * Scroll progress (0 to 1) through the story wrapper, plus a normalized pointer position.
 * Both are stored in refs, not state, so scrolling never re-renders React. The 3D scene reads them every frame.
 */
export function useStoryScroll() {
  const wrapperRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      progressRef.current = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onPointer = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return { wrapperRef, progressRef, pointerRef };
}
