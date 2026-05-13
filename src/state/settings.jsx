// Settings store provider. Hooks + constants live in ./settings-context.js
// so React Fast Refresh can keep the component edits isolated.

import { useEffect, useMemo, useState } from 'react';
import {
  SettingsContext,
  STORAGE_KEY,
  DEFAULT_SETTINGS,
} from './settings-context.js';

function loadFromStorage() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      split: { ...DEFAULT_SETTINGS.split, ...(parsed.split ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveToStorage(settings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadFromStorage());

  useEffect(() => { saveToStorage(settings); }, [settings]);

  const value = useMemo(() => ({
    settings,
    setSplit: (weekday, dayKey) => setSettings((s) => ({
      ...s,
      split: { ...s.split, [weekday]: dayKey },
    })),
    setRestTimerMode: (mode) => setSettings((s) => ({ ...s, restTimerMode: mode })),
    setUnits: (units) => setSettings((s) => ({ ...s, units })),
    resetSplit: () => setSettings((s) => ({ ...s, split: DEFAULT_SETTINGS.split })),
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
