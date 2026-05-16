// Migrations scaffold. Each persisted blob (session, archive entry,
// settings) carries a `schemaVersion` field. When the runtime loads a
// blob whose version is below CURRENT_SCHEMA_VERSION it runs every
// migration between the two, in order, producing a blob at the current
// version. Writes always stamp CURRENT_SCHEMA_VERSION.
//
// Adding a migration:
//   1. Bump CURRENT_SCHEMA_VERSION below.
//   2. Add a function `from{N}to{N+1}(blob, kind)` that returns the new shape.
//      `kind` is one of 'session' | 'archive' | 'settings'.
//   3. Register it in the MIGRATIONS array.
//
// Keep migrations pure and side-effect-free. They run on every load until
// the user re-saves, so they must be idempotent.

export const CURRENT_SCHEMA_VERSION = 1;

// Versioned migration steps. Each entry migrates blobs at the index
// version into blobs at index+1.
const MIGRATIONS = [
  // v0 → v1: stamp the schemaVersion field. Pre-Wave-3.3 blobs have
  // no `schemaVersion` and read as version 0. We've added warmup/drop
  // flags (Wave 3.2) and the notes field is now user-writable (3.1),
  // but the *shape* hasn't changed — old blobs are forward-compatible.
  // This migration is therefore the no-op identity, except it stamps
  // the version so subsequent migrations have a fixed point to start from.
  (blob /*, kind */) => ({ ...blob, schemaVersion: 1 }),
];

/**
 * Coerce a persisted blob to the current schema version. Idempotent.
 * Unknown / future versions return the blob unchanged with a warning;
 * the caller decides whether to refuse the import.
 */
export function migrate(blob, kind = 'session') {
  if (!blob || typeof blob !== 'object') return blob;
  let v = typeof blob.schemaVersion === 'number' ? blob.schemaVersion : 0;
  let out = blob;
  while (v < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) break;
    out = step(out, kind);
    v += 1;
  }
  if (v > CURRENT_SCHEMA_VERSION) {
    // Future-version blob: log once and pass through unchanged. The caller
    // (eg snapshot import) decides whether to refuse.
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[migrations] blob is at v${v}, current is v${CURRENT_SCHEMA_VERSION}. Leaving as-is.`);
    }
  }
  return out;
}

/**
 * Stamp the current schemaVersion onto a blob. Used by every write path.
 */
export function stampSchemaVersion(blob) {
  if (!blob || typeof blob !== 'object') return blob;
  return { ...blob, schemaVersion: CURRENT_SCHEMA_VERSION };
}

/**
 * Migrate an array of blobs (eg the archive). Pure.
 */
export function migrateArray(arr, kind = 'archive') {
  if (!Array.isArray(arr)) return arr;
  return arr.map((b) => migrate(b, kind));
}
