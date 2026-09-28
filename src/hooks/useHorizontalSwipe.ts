import { useCallback, useRef } from 'react';
import type React from 'react';

/** Only predominantly horizontal gestures fire; vertical scroll is untouched. */
export function useHorizontalSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: Date.now() } : null;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - s.x;
      const dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - s.t < 700) {
        (dx < 0 ? onLeft : onRight)();
      }
    },
    [onLeft, onRight]
  );

  return { onTouchStart, onTouchEnd };
}
