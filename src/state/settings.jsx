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
import { migrate, stampSchemaVersion } from '../data/migrations';

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
      setSettings(mergeSettings(migrate(value, 'settings')));
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.settings, stampSchemaVersion(settings));
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
    setLocation: (location) => setSettings((s) => {
      const loc = location === 'home' ? 'home' : 'gym';
      // Keep activeProgramKey in sync with the location's program key
      // so existing consumers (overlay provider, today.jsx) see the
      // right program after a location flip.
      const nextKey = loc === 'home'
        ? (s.homeProgramKey ?? 'home-default')
        : (s.gymProgramKey  ?? 'full-spectrum');
      return { ...s, location: loc, activeProgramKey: nextKey };
    }),
    setActiveProgramKey: (key) => setSettings((s) => {
      // Writes to whichever location is currently active. Reads still
      // come off activeProgramKey for compatibility.
      const loc = s.location === 'home' ? 'home' : 'gym';
      if (loc === 'home') {
        return { ...s, homeProgramKey: key, activeProgramKey: key };
      }
      return { ...s, gymProgramKey: key, activeProgramKey: key };
    }),
    toggleExcludedEquipment: (key) => setSettings((s) => {
      const current = s.excludedEquipment ?? [];
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      return { ...s, excludedEquipment: next };
    }),
    // Bulk: switch program key AND replace the split in one shot. Used when
    // the /me/settings switcher fires its "apply program's default split" path.
    applyProgramSplit: (key, split) => setSettings((s) => ({
      ...s,
      activeProgramKey: key,
      split: { ...DEFAULT_SETTINGS.split, ...split },
    })),
    resetSplit: () => setSettings((s) => ({ ...s, split: DEFAULT_SETTINGS.split })),
    replaceAll: (next) => setSettings(mergeSettings(next)),
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
