import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js';

/** Counts from 0 to `target` (ease-out) once `start` is true. Jumps straight to the target with reduced motion. */
export function useCountUp(target, { start = true, duration = 1400 } = {}) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || target == null) return undefined;
    if (reduced) {
      setValue(target);
      return undefined;
    }
    let frame;
    const begin = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - begin) / duration);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration, reduced]);

  return value;
}
