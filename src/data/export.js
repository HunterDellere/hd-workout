// Export / import helpers for the full app snapshot.
// Shape:
//   {
//     version: 2,
//     exportedAt: ISO,
//     settings: <Settings>,
//     activeSession: <Session> | null,
//     archive: [<Session>],
//     programOverlay: <Overlay> | null,
//     bodyweight: [<Entry>],
//   }
//
// v2 adds programOverlay (per-location swaps + adds) and bodyweight log.
// v1 snapshots are still accepted on import — missing keys default to
// empty / null so existing backups don't break.

import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './storage';
import { migrate, migrateArray, stampSchemaVersion } from './migrations';

export const SNAPSHOT_VERSION = 2;

export async function buildSnapshot() {
  const [settings, activeSession, archive, programOverlay, bodyweight] = await Promise.all([
    loadFromStorage(STORAGE_KEYS.settings),
    loadFromStorage(STORAGE_KEYS.activeSession),
    loadFromStorage(STORAGE_KEYS.archive, []),
    loadFromStorage(STORAGE_KEYS.programOverlay, {}),
    loadFromStorage(STORAGE_KEYS.bodyweight, []),
  ]);
  return {
    version: SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settings ?? null,
    activeSession: activeSession ?? null,
    archive: Array.isArray(archive) ? archive : [],
    programOverlay: programOverlay ?? null,
    bodyweight: Array.isArray(bodyweight) ? bodyweight : [],
  };
}

export function validateSnapshot(value) {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: 'Not a JSON object.' };
  }
  // Accept v1 and v2 — v1 lacks programOverlay and bodyweight; we fill
  // those with defaults on import.
  if (value.version !== 1 && value.version !== SNAPSHOT_VERSION) {
    return { ok: false, error: `Unsupported snapshot version: ${value.version}` };
  }
  if (value.archive != null && !Array.isArray(value.archive)) {
    return { ok: false, error: 'archive must be an array.' };
  }
  if (value.bodyweight != null && !Array.isArray(value.bodyweight)) {
    return { ok: false, error: 'bodyweight must be an array.' };
  }
  return { ok: true };
}

export async function applySnapshot(value) {
  const check = validateSnapshot(value);
  if (!check.ok) throw new Error(check.error);
  // Run migrations on every blob before writing — old snapshots get
  // forward-stamped; future-version blobs pass through (with a console
  // warn) so the user isn't silently downgraded.
  const settings = value.settings ? stampSchemaVersion(migrate(value.settings, 'settings')) : null;
  const activeSession = value.activeSession ? stampSchemaVersion(migrate(value.activeSession, 'session')) : null;
  const archive = Array.isArray(value.archive)
    ? migrateArray(value.archive, 'archive').map(stampSchemaVersion)
    : [];
  await saveToStorage(STORAGE_KEYS.settings, settings);
  await saveToStorage(STORAGE_KEYS.activeSession, activeSession);
  await saveToStorage(STORAGE_KEYS.archive, archive);
  // v2 keys — overlay + bodyweight. Missing → write the empty default
  // rather than leaving stale data behind.
  await saveToStorage(STORAGE_KEYS.programOverlay, value.programOverlay ?? {});
  await saveToStorage(STORAGE_KEYS.bodyweight, Array.isArray(value.bodyweight) ? value.bodyweight : []);
}

export async function wipeAll() {
  await saveToStorage(STORAGE_KEYS.settings, null);
  await saveToStorage(STORAGE_KEYS.activeSession, null);
  await saveToStorage(STORAGE_KEYS.archive, []);
  await saveToStorage(STORAGE_KEYS.programOverlay, {});
  await saveToStorage(STORAGE_KEYS.bodyweight, []);
}
