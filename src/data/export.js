// Export / import helpers for the full app snapshot.
// Shape:
//   {
//     version: 1,
//     exportedAt: ISO,
//     settings: <Settings>,
//     activeSession: <Session> | null,
//     archive: [<Session>],
//   }

import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './storage';
import { migrate, migrateArray, stampSchemaVersion } from './migrations';

export const SNAPSHOT_VERSION = 1;

export async function buildSnapshot() {
  const [settings, activeSession, archive] = await Promise.all([
    loadFromStorage(STORAGE_KEYS.settings),
    loadFromStorage(STORAGE_KEYS.activeSession),
    loadFromStorage(STORAGE_KEYS.archive, []),
  ]);
  return {
    version: SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settings ?? null,
    activeSession: activeSession ?? null,
    archive: Array.isArray(archive) ? archive : [],
  };
}

export function validateSnapshot(value) {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: 'Not a JSON object.' };
  }
  if (value.version !== SNAPSHOT_VERSION) {
    return { ok: false, error: `Unsupported snapshot version: ${value.version}` };
  }
  if (value.archive != null && !Array.isArray(value.archive)) {
    return { ok: false, error: 'archive must be an array.' };
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
}

export async function wipeAll() {
  await saveToStorage(STORAGE_KEYS.settings, null);
  await saveToStorage(STORAGE_KEYS.activeSession, null);
  await saveToStorage(STORAGE_KEYS.archive, []);
}
