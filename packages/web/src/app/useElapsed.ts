import { useEffect, useState } from 'react';

const TICK_MS = 1000;

// Whole seconds since `active` became true; 0 while inactive.
export const useElapsed = (active: boolean): number => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), TICK_MS);
    return () => window.clearInterval(timer);
  }, [active]);
  return seconds;
};
