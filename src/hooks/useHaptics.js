// Haptics — pattern palette + intensity scaling.
//
// Old impl used 6–14ms pulses, which are imperceptible through a phone in
// a pocket. New baseline is significantly stronger, with named patterns
// that map to real semantic events (logging a set, hitting the rest
// target, resting at heartbeat, alerting, etc).
//
// Intensity comes from settings.haptics:
//   off       — no vibration; the hook is a no-op
//   standard  — base patterns, clearly felt on a phone in hand
//   strong    — base × 1.6, scaled for gym-floor confidence (phone in
//               pocket, phone on bench, ambient noise)
//
// Pattern names are stable so callsites don't need to know about
// intensity. `useHaptics()` returns `fire(name)`; the hook reads
// `settings.haptics` internally.

import { useCallback } from 'react';
import { useSettings } from '../state/settings-context.js';

// Base patterns at "standard" intensity. Numbers are milliseconds; arrays
// alternate [vibrate, pause, vibrate, pause, ...].
const BASE_PATTERNS = {
  // Single sharp pulse — used for selection, navigation, tap confirm.
  tap:        40,
  // Lighter version — used for soft transitions like tab change.
  light:      25,
  // Two pulses close together — a "go" signal. Log-set commit.
  doubleTap:  [40, 50, 40],
  // Three-pulse ramp — rest target reached. Reads as "ready".
  ready:      [30, 60, 30, 60, 60],
  // Heartbeat — two close pulses, gap, repeat. For sustained "rest" feel
  // or as a meditative cue. Used in heartbeat-on-rest-target.
  heartbeat:  [60, 90, 30, 280],
  // Success — escalating triplet. Session end.
  success:    [40, 60, 60, 60, 90],
  // Alert / warning — three sharp pulses, evenly spaced.
  alert:      [80, 100, 80, 100, 80],
  // Long single pulse — undo, discard.
  long:       120,
};

// Aliases for legacy callsites (Home/Today haptic('select'), etc).
const ALIAS = {
  select: 'tap',
  medium: 'ready',
  warn:   'alert',
};

const INTENSITY_SCALE = {
  off:      0,
  standard: 1.0,
  strong:   1.6,
};

function scalePattern(pattern, scale) {
  if (scale === 0) return null;
  if (scale === 1) return pattern;
  if (typeof pattern === 'number') return Math.round(pattern * scale);
  return pattern.map((n, i) => (i % 2 === 0 ? Math.round(n * scale) : n));
}

export function useHaptics() {
  const { settings } = useSettings();
  const mode = settings?.haptics ?? 'standard';
  const scale = INTENSITY_SCALE[mode] ?? 1;

  return useCallback((name = 'tap') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return false;
    if (scale === 0) return false;

    const key = ALIAS[name] ?? name;
    const base = BASE_PATTERNS[key] ?? BASE_PATTERNS.tap;
    const scaled = scalePattern(base, scale);
    if (scaled == null) return false;

    try {
      navigator.vibrate(scaled);
      return true;
    } catch {
      return false;
    }
  }, [scale]);
}

// Exposed for the Settings page to preview each intensity + pattern.
export { BASE_PATTERNS };
export const HAPTIC_MODES = [
  { value: 'off',      label: 'Off',      hint: 'Silent.' },
  { value: 'standard', label: 'Standard', hint: 'Clearly felt in hand.' },
  { value: 'strong',   label: 'Strong',   hint: 'Felt through a pocket.' },
];
