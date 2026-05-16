import { describe, it, expect } from 'vitest';
import { migrate, stampSchemaVersion, migrateArray, CURRENT_SCHEMA_VERSION } from './index';

describe('migrate', () => {
  it('handles null / non-objects unchanged', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate(undefined)).toBeUndefined();
    expect(migrate(42)).toBe(42);
  });

  it('stamps version 0 (pre-Wave-3.3) blobs to current version', () => {
    const old = { id: 'A', performances: [] };
    const out = migrate(old, 'session');
    expect(out.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(out.id).toBe('A');
    expect(out.performances).toEqual([]);
  });

  it('is idempotent on current-version blobs', () => {
    const cur = { id: 'A', schemaVersion: CURRENT_SCHEMA_VERSION };
    expect(migrate(cur)).toEqual(cur);
  });

  it('passes future-version blobs through unchanged', () => {
    const future = { id: 'A', schemaVersion: CURRENT_SCHEMA_VERSION + 5 };
    expect(migrate(future).schemaVersion).toBe(CURRENT_SCHEMA_VERSION + 5);
  });
});

describe('stampSchemaVersion', () => {
  it('adds the current version', () => {
    expect(stampSchemaVersion({ a: 1 }).schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });
  it('overwrites an existing version', () => {
    expect(stampSchemaVersion({ schemaVersion: 99 }).schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });
  it('handles non-objects', () => {
    expect(stampSchemaVersion(null)).toBeNull();
  });
});

describe('migrateArray', () => {
  it('maps migrate across each entry', () => {
    const arr = [{ id: 'A' }, { id: 'B', schemaVersion: CURRENT_SCHEMA_VERSION }];
    const out = migrateArray(arr);
    expect(out).toHaveLength(2);
    expect(out[0].schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(out[1].schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });
  it('returns non-arrays unchanged', () => {
    expect(migrateArray(null)).toBeNull();
    expect(migrateArray(undefined)).toBeUndefined();
  });
});
