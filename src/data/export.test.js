import { describe, it, expect } from 'vitest';
import { validateSnapshot, SNAPSHOT_VERSION } from './export';
import { CURRENT_SCHEMA_VERSION } from './migrations';

describe('validateSnapshot', () => {
  it('accepts a current v2 snapshot', () => {
    const snap = { version: SNAPSHOT_VERSION, settings: {}, activeSession: null, archive: [] };
    expect(validateSnapshot(snap)).toEqual({ ok: true });
  });

  it('rejects a non-object', () => {
    expect(validateSnapshot(null).ok).toBe(false);
    expect(validateSnapshot('x').ok).toBe(false);
  });

  it('rejects an unsupported snapshot version', () => {
    expect(validateSnapshot({ version: 99 }).ok).toBe(false);
  });

  it('rejects a snapshot whose blob carries a future schemaVersion', () => {
    const snap = {
      version: SNAPSHOT_VERSION,
      settings: { schemaVersion: CURRENT_SCHEMA_VERSION + 1 },
      activeSession: null,
      archive: [],
    };
    const res = validateSnapshot(snap);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/newer version/i);
  });

  it('rejects when a future schemaVersion hides inside the archive', () => {
    const snap = {
      version: SNAPSHOT_VERSION,
      settings: {},
      activeSession: null,
      archive: [{ id: 'a', schemaVersion: CURRENT_SCHEMA_VERSION + 2 }],
    };
    expect(validateSnapshot(snap).ok).toBe(false);
  });
});
