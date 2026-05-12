import { useCallback } from 'react';

const PATTERNS = {
  tap: 10,
  light: 6,
  select: 14,
  warn: [10, 40, 10],
  success: [6, 18, 6],
};

export function useHaptics() {
  const fire = useCallback((pattern = 'tap') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return false;
    const p = typeof pattern === 'string' ? PATTERNS[pattern] ?? PATTERNS.tap : pattern;
    try {
      navigator.vibrate(p);
      return true;
    } catch {
      return false;
    }
  }, []);
  return fire;
}
