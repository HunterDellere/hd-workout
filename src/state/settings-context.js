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
};

export const DAY_OPTIONS = ['push', 'pull', 'legs', 'core', 'rest'];
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
