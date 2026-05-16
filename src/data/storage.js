// Storage layer: IDB via idb-keyval, with a transparent per-key
// localStorage→IDB migration. A key is migrated the first time it's read
// when IDB has no value but localStorage does; otherwise IDB is the
// source of truth.
//
// Keys:
//   hdw:session:active     — the active in-workout session (or null)
//   hdw:settings           — user settings (split, timer mode, units, haptics)
//   hdw:sessions:archive   — array of completed sessions, newest last

import { get, set, del } from 'idb-keyval';

const MIGRATABLE_KEYS = new Set([
  'hdw:session:active',
  'hdw:settings',
]);

async function migrateKeyIfNeeded(key, idbValue) {
  if (idbValue !== undefined) return idbValue;
  if (!MIGRATABLE_KEYS.has(key)) return undefined;
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return undefined;
    const parsed = JSON.parse(raw);
    await set(key, parsed);
    window.localStorage.removeItem(key);
    return parsed;
  } catch {
    return undefined;
  }
}

export async function loadFromStorage(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = await get(key);
    const after = await migrateKeyIfNeeded(key, value);
    const resolved = after !== undefined ? after : value;
    return resolved === undefined ? fallback : resolved;
  } catch {
    return fallback;
  }
}

export async function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null || value === undefined) {
      await del(key);
    } else {
      await set(key, value);
    }
  } catch {
    /* noop */
  }
}

export const STORAGE_KEYS = {
  activeSession: 'hdw:session:active',
  settings: 'hdw:settings',
  archive: 'hdw:sessions:archive',
  // Phase 4 slice 2 scaffold: per-user overrides on top of a program
  // template. Read-only until the fork-and-edit UI lands.
  programOverlay: 'hdw:program:overlay',
};
