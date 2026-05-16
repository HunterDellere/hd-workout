// Data hub — hydrates the day-shape consumers expect from the catalog +
// program.
//
// Phase 4 slice 1: prescription (sets + rest) moved out of the catalog
// (push/pull/legs/core/recovery.js) and into the program template
// (programs/full-spectrum.js). The catalog now owns *movement* — name,
// cues, safety, variants, tags. The program owns *programming* — order,
// dose, rest.
//
// The public API (`getDay`, `getSection`, `getExercise`, `findExerciseAnywhere`)
// returns the same combined shape as before — exercises with `sets` and `rest`
// stamped on — so no page or component needs to change. Tests that snapshot
// the shape will diff cleanly: identical fields, identical values.

import pushCatalog from './push';
import pullCatalog from './pull';
import legsCatalog from './legs';
import coreCatalog from './core';
import recoveryCatalog from './recovery';
import {
  PROGRAMS,
  PROGRAM_LIST,
  GYM_PROGRAMS,
  HOME_PROGRAMS,
  DEFAULT_PROGRAM_KEY,
  getActiveProgram,
  fullSpectrum,
} from './programs/index';
import { validateProgram } from './programs/validate';
import { principles, injuryPrevention } from './principles';

const CATALOG_BY_DAY = {
  push: pushCatalog,
  pull: pullCatalog,
  legs: legsCatalog,
  core: coreCatalog,
  recovery: recoveryCatalog,
};

// Slice 2: default to Full Spectrum. A future slice will read the active
// program from settings.activeProgramKey at the React layer and re-hydrate
// when the user switches. Module-scope hydration stays cheap and stable.
const ACTIVE_PROGRAM = fullSpectrum;

// Dev-mode sanity check: log validation issues once at boot. In production
// the call short-circuits (the function is pure and cheap, but the warn
// path is dead code under Vite's import.meta.env.DEV).
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  for (const program of Object.values(PROGRAMS)) {
    const issues = validateProgram(program, {
      push: pushCatalog,
      pull: pullCatalog,
      legs: legsCatalog,
      core: coreCatalog,
      recovery: recoveryCatalog,
    });
    for (const issue of issues) {
      console.warn(`[programs:${program.key}] ${issue.message}`);
    }
  }
}

// Build a {id: exercise} lookup across all day catalogs for O(1) hydration.
function buildCatalogIndex() {
  const out = new Map();
  for (const day of Object.values(CATALOG_BY_DAY)) {
    for (const section of day.sections ?? []) {
      for (const ex of section.exercises ?? []) {
        out.set(ex.id, ex);
      }
    }
  }
  return out;
}

const CATALOG_INDEX = buildCatalogIndex();

function hydrateExerciseEntry(programEntry) {
  const ex = CATALOG_INDEX.get(programEntry.id);
  if (!ex) return null;
  return { ...ex, sets: programEntry.sets, rest: programEntry.rest };
}

function hydrateDayFrom(program, dayKey) {
  const catalog = CATALOG_BY_DAY[dayKey];
  if (!catalog) return null;
  const programDay = program?.days?.[dayKey];
  if (!programDay) return null;

  const sections = [];
  for (const catalogSection of catalog.sections ?? []) {
    const programSection = programDay[catalogSection.key];
    if (!programSection) continue;
    const exercises = programSection
      .map(hydrateExerciseEntry)
      .filter(Boolean);
    sections.push({
      key: catalogSection.key,
      title: catalogSection.title,
      blurb: catalogSection.blurb,
      exercises,
    });
  }

  return {
    key: catalog.key,
    name: catalog.name,
    subtitle: catalog.subtitle,
    description: catalog.description,
    sections,
  };
}

// Pure: hydrate every day of a program. Used by the React layer to compute
// a fresh days-map when the user switches program or edits the overlay.
export function hydrateProgram(program) {
  return Object.fromEntries(
    Object.keys(CATALOG_BY_DAY).map((k) => [k, hydrateDayFrom(program, k)]),
  );
}

// Module-level default hydration — Full Spectrum, no overlay. Stable
// object identity for consumers that haven't opted into overlay-aware
// hydration yet.
const HYDRATED = hydrateProgram(ACTIVE_PROGRAM);

export const days = HYDRATED;
export const dayList = Object.values(HYDRATED).filter(Boolean);

export function getDay(key) {
  return HYDRATED[key] ?? null;
}

export function getSection(dayKey, sectionKey) {
  const d = HYDRATED[dayKey];
  if (!d) return null;
  return d.sections.find((s) => s.key === sectionKey) ?? null;
}

export function getExercise(dayKey, exerciseId) {
  const d = HYDRATED[dayKey];
  if (!d) return null;
  for (const section of d.sections) {
    const ex = section.exercises.find((e) => e.id === exerciseId);
    if (ex) return { exercise: ex, section, day: d };
  }
  return null;
}

export function findExerciseAnywhere(exerciseId) {
  // Walk the RAW catalog (every authored exercise), not the hydrated
  // dayList — which only includes program-referenced entries. Many
  // movements live in the catalog without being programmed by default
  // (home A/S additions like push-pushup, push-band-press, etc.) and
  // they must still be findable for the SlotPicker, SubstituteSheet,
  // Library, and History detail.
  for (const day of Object.values(CATALOG_BY_DAY)) {
    for (const section of day.sections ?? []) {
      const ex = section.exercises?.find((e) => e.id === exerciseId);
      if (ex) return { exercise: ex, section, day };
    }
  }
  return null;
}

// Walk every authored catalog entry. Used by SlotPicker so newly-added
// movements that aren't referenced by any program are still pickable.
export function rawCatalogList() {
  const out = [];
  for (const day of Object.values(CATALOG_BY_DAY)) {
    for (const section of day.sections ?? []) {
      for (const ex of section.exercises ?? []) {
        out.push({ ...ex, _day: day.key, _section: { key: section.key, title: section.title } });
      }
    }
  }
  return out;
}

// Back-compat named exports for callers that pull a specific day directly.
// These now resolve to the hydrated day (catalog + program), not the raw
// catalog module. Any code that needs movement-only data should import
// from the catalog file directly.
export const push = HYDRATED.push;
export const pull = HYDRATED.pull;
export const legs = HYDRATED.legs;
export const core = HYDRATED.core;
export const recovery = HYDRATED.recovery;

export { principles, injuryPrevention };
export {
  fullSpectrum,
  PROGRAMS,
  PROGRAM_LIST,
  GYM_PROGRAMS,
  HOME_PROGRAMS,
  DEFAULT_PROGRAM_KEY,
  getActiveProgram,
};
export { applyOverlay } from './programs/overlay';
