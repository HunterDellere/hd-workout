// Context object + non-component exports for the settings store.
// Kept separate from the Provider component so React Fast Refresh stays
// happy with the .jsx file holding only the component.

import { createContext, useContext } from 'react';

export const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

export const STORAGE_KEY = 'hdw:settings';

export const DEFAULT_SETTINGS = {
  split: {
    // Default rotation: 4 training days, 3 rest days a week. Tunable in /me.
    0: 'rest',
    1: 'push',
    2: 'pull',
    3: 'rest',
    4: 'legs',
    5: 'core',
    6: 'rest',
  },
  restTimerMode: 'count-up',
  units: 'kg',
  haptics: 'standard', // off | standard | strong
  intelligenceEnabled: true, // Phase 3 surface: PRs, volume, heatmap. On by default from session 16; existing users keep their persisted choice.
  // Active program per location. `location` selects which key is live;
  // each location remembers its own program independently so switching
  // gym → home doesn't reshuffle the gym build. `activeProgramKey` is
  // kept as a derived alias for back-compat with the slice-2 seam.
  activeProgramKey: 'full-spectrum',
  gymProgramKey:  'full-spectrum',
  homeProgramKey: 'home-default',
  // Location preset — toggles which equipment-scoped overlay applies on
  // /today. 'gym' keeps the full catalog; 'home' biases to dumbbell /
  // bodyweight / band variants. Each location remembers its own swaps.
  location: 'gym',
  // Equipment the user does NOT have. Filters SubstituteSheet + SlotPicker
  // candidate lists. Composes with the location preset: location decides
  // which overlay bucket is active, excludedEquipment narrows the candidate
  // pool for any swap/add operation regardless of location.
  excludedEquipment: [],
  // Onboarding: dismissed forever after the first-launch flow completes
  // or is explicitly skipped. New installs start at false → flow renders.
  onboarded: false,
  // Plate calculator: bar weight + plate inventory. null falls back to
  // defaults from src/data/plates.js (20kg / 45lb bar, standard
  // pyramid of plates). Per-unit so the user can carry separate kg/lb
  // setups if they train across units.
  barWeightKg: null,
  barWeightLb: null,
  platesKg: null, // null = use defaults
  platesLb: null,
  plateCalculatorEnabled: true,
  // Favorite exercise ids — list of exercise ids the user has starred.
  // Surfaced as a "Favorites" group at the top of /library when non-empty.
  // Single source of truth for star state on ExerciseSheet + Exercise page.
  favoriteExerciseIds: [],
  // One-day routine swap. Stamped with the local YYYY-MM-DD it was set on
  // so it only applies to today; tomorrow it's silently ignored and the
  // user is back on their scheduled split. Use case: "I can't lift today,
  // run recovery instead" — no permanent reshuffle.
  todayOverride: null, // { date: 'YYYY-MM-DD', dayKey: string } | null
};

export const DAY_OPTIONS = ['push', 'pull', 'legs', 'core', 'recovery', 'rest'];
export const WEEKDAYS = [
  { idx: 1, label: 'Monday' },
  { idx: 2, label: 'Tuesday' },
  { idx: 3, label: 'Wednesday' },
  { idx: 4, label: 'Thursday' },
  { idx: 5, label: 'Friday' },
  { idx: 6, label: 'Saturday' },
  { idx: 0, label: 'Sunday' },
];

export function dayKeyForToday(split, now = new Date()) {
  return split[now.getDay()] ?? null;
}

// Local YYYY-MM-DD for `now`. Uses the host TZ — the override is meant to
// be "today's calendar day" from the lifter's perspective, not UTC.
export function localDateKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Apply a one-day override to the regular split. Override is honoured only
// when its stamped date matches today; otherwise we fall through to the
// scheduled split. Returns { dayKey, fromOverride, scheduledKey }.
export function effectiveTodayKey(settings, now = new Date()) {
  const scheduledKey = dayKeyForToday(settings.split, now);
  const ov = settings.todayOverride;
  if (ov && ov.dayKey && ov.date === localDateKey(now)) {
    return { dayKey: ov.dayKey, fromOverride: true, scheduledKey };
  }
  return { dayKey: scheduledKey, fromOverride: false, scheduledKey };
}
