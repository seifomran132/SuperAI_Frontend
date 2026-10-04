import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown for "resend". Counts against a deadline (not by decrementing) so a
 * throttled background tab still shows the right number.
 */
export function useCooldown(seconds: number, startActive = false) {
  const [remaining, setRemaining] = useState(startActive ? seconds : 0);
  const deadline = useRef<number | null>(
    startActive ? Date.now() + seconds * 1000 : null,
  );

  const start = useCallback(() => {
    deadline.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
  }, [seconds]);

  const active = remaining > 0;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (deadline.current === null) return;
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left === 0) deadline.current = null;
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return { remaining, active, start };
}
