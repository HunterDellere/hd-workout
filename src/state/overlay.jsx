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
import { stampSchemaVersion } from '../data/migrations';
import {
  getActiveProgram,
  DEFAULT_PROGRAM_KEY,
  applyOverlay,
  hydrateProgram,
  findExerciseById,
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
// `rest` overrides; this helper handles `__added` (entries) and
// `__addedSections` (whole user-named sections that don't exist in the
// program template — e.g. dropping Cardio onto core day).
function withAddedEntries(program, overlay) {
  const programOverlay = overlay?.[program.key];
  if (!programOverlay) return program;
  const days = {};
  for (const [dayKey, sections] of Object.entries(program.days ?? {})) {
    const dayOverlay = programOverlay[dayKey] ?? {};
    const nextSections = {};
    // 1) Real program sections — merge `__added` entries in.
    for (const [sectionKey, entries] of Object.entries(sections ?? {})) {
      const added = dayOverlay[sectionKey]?.__added;
      nextSections[sectionKey] = (added && added.length > 0)
        ? [...entries, ...added]
        : entries;
    }
    // 2) User-added sections — anything in the overlay that has __added
    // entries but isn't a real program section key gets surfaced as a
    // first-class section. Title carried by the overlay.
    for (const [sectionKey, sectionOverlay] of Object.entries(dayOverlay)) {
      if (sections?.[sectionKey]) continue; // already merged above
      const added = sectionOverlay?.__added;
      if (added && added.length > 0) {
        nextSections[sectionKey] = added;
      }
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
  const activeProgramKey = settings?.activeProgramKey ?? DEFAULT_PROGRAM_KEY;
  const activeProgram = useMemo(() => getActiveProgram(activeProgramKey), [activeProgramKey]);

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
    saveToStorage(STORAGE_KEYS.programOverlay, stampSchemaVersion(overlayByLocation));
  }, [overlayByLocation, hydrated]);

  // The active-location slice — what the rest of the app reads as "the overlay".
  const overlay = overlayByLocation[location] ?? EMPTY_PROGRAM_OVERLAY;

  // Effective hydrated days for the active program — re-derived only when
  // the active-location overlay changes. Post-hydration we splice in any
  // user-added sections (carried on the overlay with a `__title`) since
  // the catalog-driven hydrator only knows about authored section keys.
  const days = useMemo(() => {
    const merged = applyOverlay(withAddedEntries(activeProgram, overlay), overlay);
    const hydrated = hydrateProgram(merged);
    const programOverlay = overlay?.[activeProgram.key];
    if (!programOverlay) return hydrated;
    const out = { ...hydrated };
    for (const [dayKey, dayOverlay] of Object.entries(programOverlay)) {
      const day = out[dayKey];
      if (!day) continue;
      const existingKeys = new Set(day.sections.map((s) => s.key));
      const extraSections = [];
      for (const [sectionKey, sectionOverlay] of Object.entries(dayOverlay)) {
        if (existingKeys.has(sectionKey)) continue;
        const added = sectionOverlay?.__added;
        if (!added || added.length === 0) continue;
        // Hydrate the added entries against the catalog so the row shape
        // matches authored sections (name, tier, cues, etc.).
        const hydratedEntries = added
          .map((e) => {
            const cat = findExerciseById(e.id);
            if (!cat) return null;
            return { ...cat, sets: e.sets, rest: e.rest };
          })
          .filter(Boolean);
        if (hydratedEntries.length === 0) continue;
        extraSections.push({
          key: sectionKey,
          title: sectionOverlay.__title ?? sectionKey,
          blurb: null,
          exercises: hydratedEntries,
        });
      }
      if (extraSections.length > 0) {
        out[dayKey] = { ...day, sections: [...day.sections, ...extraSections] };
      }
    }
    return out;
  }, [overlay, activeProgram]);

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
      const programKey = activeProgram.key;
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
  }, [mutateActive, activeProgram.key]);

  const hideExercise = useCallback((dayKey, sectionKey, exerciseId) => {
    updateEntry(dayKey, sectionKey, exerciseId, { hidden: true });
  }, [updateEntry]);

  const unhideExercise = useCallback((dayKey, sectionKey, exerciseId) => {
    mutateActive((prev) => {
      const programKey = activeProgram.key;
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
  }, [mutateActive, activeProgram.key]);

  // Adds a brand-new user-named section to a day (pre-start), seeded with
  // a first exercise. `__title` is stamped alongside `__added` so the
  // hydration step can label the section properly.
  const addCustomSection = useCallback((dayKey, sectionKey, title, firstEntry) => {
    if (!sectionKey || !firstEntry) return;
    mutateActive((prev) => {
      const programKey = activeProgram.key;
      const prog = { ...(prev[programKey] ?? {}) };
      const day = { ...(prog[dayKey] ?? {}) };
      if (day[sectionKey]) return prev; // already exists
      day[sectionKey] = { __title: title, __added: [firstEntry] };
      prog[dayKey] = day;
      return { ...prev, [programKey]: prog };
    });
  }, [mutateActive, activeProgram.key]);

  const addExercise = useCallback((dayKey, sectionKey, entry) => {
    // entry: { id, sets, rest }
    mutateActive((prev) => {
      const programKey = activeProgram.key;
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
  }, [mutateActive, activeProgram.key]);

  const removeAddedExercise = useCallback((dayKey, sectionKey, exerciseId) => {
    mutateActive((prev) => {
      const programKey = activeProgram.key;
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
  }, [mutateActive, activeProgram.key]);

  const swapExerciseOverlay = useCallback((dayKey, sectionKey, currentId, newEntry) => {
    // Used by the pre-start swap: hide the original and add the new one.
    // Persisted: next time the user opens /today, the swap is still there.
    hideExercise(dayKey, sectionKey, currentId);
    addExercise(dayKey, sectionKey, newEntry);
  }, [hideExercise, addExercise]);

  const resetDay = useCallback((dayKey) => {
    mutateActive((prev) => {
      const programKey = activeProgram.key;
      const prog = prev[programKey];
      if (!prog?.[dayKey]) return prev;
      const next = { ...prog };
      delete next[dayKey];
      return { ...prev, [programKey]: next };
    });
  }, [mutateActive, activeProgram.key]);

  // Per-section reset: surgical undo for one section's overlay edits
  // (swaps, hides, adds) without disturbing the rest of the day. Pulled
  // out of the wholesale resetDay so the user can keep their push-day
  // experiment while reverting just the warmup, for example.
  const resetSection = useCallback((dayKey, sectionKey) => {
    mutateActive((prev) => {
      const programKey = activeProgram.key;
      const day = prev[programKey]?.[dayKey];
      if (!day?.[sectionKey]) return prev;
      const nextDay = { ...day };
      delete nextDay[sectionKey];
      // If the day no longer has any section overlays, drop it entirely
      // so the overlay tree stays minimal.
      const dayEmpty = Object.keys(nextDay).length === 0;
      const nextProg = { ...prev[programKey] };
      if (dayEmpty) {
        delete nextProg[dayKey];
      } else {
        nextProg[dayKey] = nextDay;
      }
      return { ...prev, [programKey]: nextProg };
    });
  }, [mutateActive, activeProgram.key]);

  // Reset to default routine — wipes BOTH gym and home overlays so the
  // user returns to the seeded programs. Used by /me/settings.
  const resetAllOverlays = useCallback(() => {
    setOverlayByLocation({ gym: {}, home: {} });
  }, []);

  const value = useMemo(() => ({
    overlay,
    hydrated,
    days,
    updateEntry,
    hideExercise,
    unhideExercise,
    addExercise,
    addCustomSection,
    removeAddedExercise,
    swapExerciseOverlay,
    resetDay,
    resetSection,
    resetAllOverlays,
  }), [overlay, hydrated, days, updateEntry, hideExercise, unhideExercise,
    addExercise, addCustomSection, removeAddedExercise, swapExerciseOverlay, resetDay, resetSection, resetAllOverlays]);

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}
