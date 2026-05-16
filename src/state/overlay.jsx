// Overlay provider — loads from IDB, exposes mutation helpers,
// re-hydrates the active program on every overlay change.
//
// Location-scoped overlays: the persisted shape is
//   { gym: <programOverlay>, home: <programOverlay> }
// and the active location selector lives in settings.location. Legacy
// flat shape (single programOverlay) is migrated on first read: assigned
// to 'gym' so existing users keep their swaps under that preset.

import { useEffect, useMemo, useState, useCallback } from 'react';
import { OverlayContext } from './overlay-context.js';
import { useSettings } from './settings-context.js';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../data/storage';
import {
  fullSpectrum,
  applyOverlay,
  hydrateProgram,
} from '../data';

const EMPTY_PROGRAM_OVERLAY = {};

function isLocationKeyed(value) {
  if (!value || typeof value !== 'object') return false;
  return 'gym' in value || 'home' in value;
}

function migrateLegacy(value) {
  // Legacy: flat programOverlay (no location wrapper). Assign to 'gym'.
  if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
    return { gym: {}, home: {} };
  }
  if (isLocationKeyed(value)) {
    return {
      gym: value.gym ?? {},
      home: value.home ?? {},
    };
  }
  return { gym: value, home: {} };
}

// Section-add lives outside the slice-2 pure `applyOverlay` because the
// `__added` entries need to be appended at hydrate time so the catalog
// metadata is available. Pure-program apply handles `hidden`, `sets`,
// `rest` overrides; this helper handles `__added`.
function withAddedEntries(program, overlay) {
  const programOverlay = overlay?.[program.key];
  if (!programOverlay) return program;
  const days = {};
  for (const [dayKey, sections] of Object.entries(program.days ?? {})) {
    const dayOverlay = programOverlay[dayKey] ?? {};
    const nextSections = {};
    for (const [sectionKey, entries] of Object.entries(sections ?? {})) {
      const added = dayOverlay[sectionKey]?.__added;
      nextSections[sectionKey] = (added && added.length > 0)
        ? [...entries, ...added]
        : entries;
    }
    days[dayKey] = nextSections;
  }
  return { ...program, days };
}

export function OverlayProvider({ children }) {
  // overlayByLocation holds both presets — { gym: {...}, home: {...} }.
  // The active location comes from settings; mutations only touch the
  // active slot, so switching presets leaves the other intact.
  const [overlayByLocation, setOverlayByLocation] = useState({ gym: {}, home: {} });
  const [hydrated, setHydrated] = useState(false);
  const { settings } = useSettings();
  const location = settings?.location === 'home' ? 'home' : 'gym';

  useEffect(() => {
    let cancelled = false;
    loadFromStorage(STORAGE_KEYS.programOverlay, {}).then((value) => {
      if (cancelled) return;
      setOverlayByLocation(migrateLegacy(value));
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.programOverlay, overlayByLocation);
  }, [overlayByLocation, hydrated]);

  // The active-location slice — what the rest of the app reads as "the overlay".
  const overlay = overlayByLocation[location] ?? EMPTY_PROGRAM_OVERLAY;

  // Effective hydrated days for the active program — re-derived only when
  // the active-location overlay changes.
  const days = useMemo(() => {
    const merged = applyOverlay(withAddedEntries(fullSpectrum, overlay), overlay);
    return hydrateProgram(merged);
  }, [overlay]);

  // Helper for mutation: applies a (prevProgramOverlay) → nextProgramOverlay
  // updater to ONLY the active location slot. Other location's data stays put.
  const mutateActive = useCallback((updater) => {
    setOverlayByLocation((prevAll) => {
      const prevForLoc = prevAll[location] ?? {};
      const nextForLoc = updater(prevForLoc);
      if (nextForLoc === prevForLoc) return prevAll;
      return { ...prevAll, [location]: nextForLoc };
    });
  }, [location]);

  const updateEntry = useCallback((dayKey, sectionKey, exerciseId, patch) => {
    mutateActive((prev) => {
      const programKey = fullSpectrum.key;
      const prog = { ...(prev[programKey] ?? {}) };
      const day = { ...(prog[dayKey] ?? {}) };
      const section = { ...(day[sectionKey] ?? {}) };
      const existing = section[exerciseId] ?? {};
      const next = { ...existing, ...patch };
      // Prune empty entries to keep the overlay small.
      const isEmpty = !next.sets && !next.rest && !next.hidden;
      if (isEmpty) {
        delete section[exerciseId];
      } else {
        section[exerciseId] = next;
      }
      day[sectionKey] = section;
      prog[dayKey] = day;
      return { ...prev, [programKey]: prog };
    });
  }, [mutateActive]);

  const hideExercise = useCallback((dayKey, sectionKey, exerciseId) => {
    updateEntry(dayKey, sectionKey, exerciseId, { hidden: true });
  }, [updateEntry]);

  const unhideExercise = useCallback((dayKey, sectionKey, exerciseId) => {
    mutateActive((prev) => {
      const programKey = fullSpectrum.key;
      const section = prev[programKey]?.[dayKey]?.[sectionKey];
      if (!section || !section[exerciseId]) return prev;
      const nextSection = { ...section };
      const current = nextSection[exerciseId] ?? {};
      const rest = { ...current };
      delete rest.hidden;
      if (!rest.sets && !rest.rest) {
        delete nextSection[exerciseId];
      } else {
        nextSection[exerciseId] = rest;
      }
      return {
        ...prev,
        [programKey]: {
          ...prev[programKey],
          [dayKey]: {
            ...prev[programKey][dayKey],
            [sectionKey]: nextSection,
          },
        },
      };
    });
  }, [mutateActive]);

  const addExercise = useCallback((dayKey, sectionKey, entry) => {
    // entry: { id, sets, rest }
    mutateActive((prev) => {
      const programKey = fullSpectrum.key;
      const prog = { ...(prev[programKey] ?? {}) };
      const day = { ...(prog[dayKey] ?? {}) };
      const section = { ...(day[sectionKey] ?? {}) };
      const added = section.__added ?? [];
      if (added.some((e) => e.id === entry.id)) return prev;
      section.__added = [...added, entry];
      day[sectionKey] = section;
      prog[dayKey] = day;
      return { ...prev, [programKey]: prog };
    });
  }, [mutateActive]);

  const removeAddedExercise = useCallback((dayKey, sectionKey, exerciseId) => {
    mutateActive((prev) => {
      const programKey = fullSpectrum.key;
      const section = prev[programKey]?.[dayKey]?.[sectionKey];
      if (!section?.__added) return prev;
      const nextAdded = section.__added.filter((e) => e.id !== exerciseId);
      const nextSection = { ...section };
      if (nextAdded.length === 0) {
        delete nextSection.__added;
      } else {
        nextSection.__added = nextAdded;
      }
      return {
        ...prev,
        [programKey]: {
          ...prev[programKey],
          [dayKey]: {
            ...prev[programKey][dayKey],
            [sectionKey]: nextSection,
          },
        },
      };
    });
  }, [mutateActive]);

  const swapExerciseOverlay = useCallback((dayKey, sectionKey, currentId, newEntry) => {
    // Used by the pre-start swap: hide the original and add the new one.
    // Persisted: next time the user opens /today, the swap is still there.
    hideExercise(dayKey, sectionKey, currentId);
    addExercise(dayKey, sectionKey, newEntry);
  }, [hideExercise, addExercise]);

  const resetDay = useCallback((dayKey) => {
    mutateActive((prev) => {
      const programKey = fullSpectrum.key;
      const prog = prev[programKey];
      if (!prog?.[dayKey]) return prev;
      const next = { ...prog };
      delete next[dayKey];
      return { ...prev, [programKey]: next };
    });
  }, [mutateActive]);

  const value = useMemo(() => ({
    overlay,
    hydrated,
    days,
    updateEntry,
    hideExercise,
    unhideExercise,
    addExercise,
    removeAddedExercise,
    swapExerciseOverlay,
    resetDay,
  }), [overlay, hydrated, days, updateEntry, hideExercise, unhideExercise,
    addExercise, removeAddedExercise, swapExerciseOverlay, resetDay]);

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}
