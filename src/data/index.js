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
import { fullSpectrum } from './programs/full-spectrum';
import { principles, injuryPrevention } from './principles';

const CATALOG_BY_DAY = {
  push: pushCatalog,
  pull: pullCatalog,
  legs: legsCatalog,
  core: coreCatalog,
  recovery: recoveryCatalog,
};

const ACTIVE_PROGRAM = fullSpectrum;

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

// Resolve a single (dayKey, sectionKey, exerciseId) → the combined exercise
// object the rest of the app expects: catalog fields + the program's
// prescription stamped on as `sets` and `rest`.
function hydrateExercise(dayKey, sectionKey, programEntry) {
  const ex = CATALOG_INDEX.get(programEntry.id);
  if (!ex) return null;
  return { ...ex, sets: programEntry.sets, rest: programEntry.rest };
}

// Hydrate an entire day: pulls section metadata (title, blurb) from the
// catalog day file and section ordering + exercise ordering + prescription
// from the program template. Sections present in the catalog but absent
// from the program are dropped (cleanly: a future PPL program can omit a
// catalog section without ripping it out of the catalog).
function hydrateDay(dayKey) {
  const catalog = CATALOG_BY_DAY[dayKey];
  if (!catalog) return null;
  const programDay = ACTIVE_PROGRAM.days[dayKey];
  if (!programDay) return null;

  const sections = [];
  for (const catalogSection of catalog.sections ?? []) {
    const programSection = programDay[catalogSection.key];
    if (!programSection) continue;
    const exercises = programSection
      .map((entry) => hydrateExercise(dayKey, catalogSection.key, entry))
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

// Pre-compute hydrated days so consumers (and React renders) see stable
// object references across calls — important because PerformanceCard and
// friends key on identity in some paths.
const HYDRATED = Object.fromEntries(
  Object.keys(CATALOG_BY_DAY).map((k) => [k, hydrateDay(k)]),
);

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
  for (const d of dayList) {
    for (const s of d.sections) {
      const ex = s.exercises.find((e) => e.id === exerciseId);
      if (ex) return { exercise: ex, section: s, day: d };
    }
  }
  return null;
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
export { fullSpectrum };
