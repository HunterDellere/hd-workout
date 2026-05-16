// Programs registry — keyed by program.key, exposes the active program.
//
// Phase 4 slice 2: introduces the seam so a future slice can swap the
// active program by settings.activeProgramKey without touching the data
// hub. Today, only Full Spectrum exists — `getActiveProgram()` falls back
// to it for any unknown key, with a single dev-mode warning the first
// time the fallback fires.

import { fullSpectrum } from './full-spectrum';
import { ppl6 } from './ppl-6';

export const PROGRAMS = {
  [fullSpectrum.key]: fullSpectrum,
  [ppl6.key]: ppl6,
};

// Order shown in the /me/settings switcher (default first).
export const PROGRAM_LIST = [fullSpectrum, ppl6];

export const DEFAULT_PROGRAM_KEY = fullSpectrum.key;

let warnedMissing = new Set();

export function getProgram(key) {
  if (!key) return null;
  return PROGRAMS[key] ?? null;
}

export function getActiveProgram(activeProgramKey) {
  const found = activeProgramKey ? PROGRAMS[activeProgramKey] : null;
  if (found) return found;
  if (activeProgramKey && !warnedMissing.has(activeProgramKey)
      && typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    warnedMissing.add(activeProgramKey);
    console.warn(
      `[programs] Unknown activeProgramKey "${activeProgramKey}"; `
      + `falling back to "${DEFAULT_PROGRAM_KEY}". `
      + `Known: ${Object.keys(PROGRAMS).join(', ')}.`,
    );
  }
  return PROGRAMS[DEFAULT_PROGRAM_KEY];
}

// Test-only escape hatch. Resets the one-shot warn cache so a test can
// re-trigger the warning path without process boundaries.
export function _resetProgramWarnings() {
  warnedMissing = new Set();
}

export { fullSpectrum, ppl6 };
