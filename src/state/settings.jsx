// Settings store provider. Hooks + constants live in ./settings-context.js
// so React Fast Refresh can keep the component edits isolated.
//
// Phase 2 slice 2: storage layer swapped from localStorage to IDB
// (via src/data/storage.js). Shape unchanged. First IDB load triggers a
// one-shot migration from any legacy localStorage value.

import { useEffect, useMemo, useState } from 'react';
import {
  SettingsContext,
  DEFAULT_SETTINGS,
} from './settings-context.js';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../data/storage';

function mergeSettings(parsed) {
  if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    split: { ...DEFAULT_SETTINGS.split, ...(parsed.split ?? {}) },
  };
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadFromStorage(STORAGE_KEYS.settings).then((value) => {
      if (cancelled) return;
      setSettings(mergeSettings(value));
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.settings, settings);
  }, [settings, hydrated]);

  const value = useMemo(() => ({
    settings,
    setSplit: (weekday, dayKey) => setSettings((s) => ({
      ...s,
      split: { ...s.split, [weekday]: dayKey },
    })),
    setRestTimerMode: (mode) => setSettings((s) => ({ ...s, restTimerMode: mode })),
    setUnits: (units) => setSettings((s) => ({ ...s, units })),
    setHaptics: (haptics) => setSettings((s) => ({ ...s, haptics })),
    setIntelligenceEnabled: (enabled) => setSettings((s) => ({ ...s, intelligenceEnabled: !!enabled })),
    resetSplit: () => setSettings((s) => ({ ...s, split: DEFAULT_SETTINGS.split })),
    replaceAll: (next) => setSettings(mergeSettings(next)),
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
