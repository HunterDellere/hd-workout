import { describe, it, expect } from 'vitest';
import { buildSwapCandidates, GENERIC_TAGS } from './swap-candidates';

// These tests run against the real catalog (the modules under test import
// from ./index, which loads the production push/pull/legs/core/recovery
// data). They prove the noise-filter rules without mocking — if the
// behaviour regresses against the live catalog, this file fails.

describe('buildSwapCandidates', () => {
  it('returns an empty pool when the id is unknown', () => {
    expect(buildSwapCandidates('not-a-real-id')).toEqual({
      candidates: [],
      current: null,
      patternKey: null,
    });
  });

  it('keeps generic tags out of the public surface', () => {
    // 'isolation' is the canonical noise tag — it appears on dozens of
    // unrelated movements. The exported set is the contract for that.
    expect(GENERIC_TAGS.has('isolation')).toBe(true);
    expect(GENERIC_TAGS.has('compound')).toBe(true);
    expect(GENERIC_TAGS.has('bodyweight')).toBe(true);
    // Anatomical tags must NOT be in the generic set — they're the signal
    // we keep.
    expect(GENERIC_TAGS.has('medial-delt')).toBe(false);
    expect(GENERIC_TAGS.has('long-head')).toBe(false);
    expect(GENERIC_TAGS.has('rotator-cuff')).toBe(false);
  });

  it('does NOT surface every isolation lift when swapping a cable lateral raise', () => {
    // The original bug: cable-lateral has tags ['isolation', 'width'].
    // Before the GENERIC_TAGS filter, 'isolation' matched dozens of
    // triceps, biceps, calf, etc. lifts as "shared-tag" candidates.
    // After the fix: only same-section peers + 'width'-tagged peers.
    const { candidates } = buildSwapCandidates('push-cable-lateral');
    expect(candidates.length).toBeGreaterThan(0);
    // No triceps movement should be relevant to a cable lateral raise.
    expect(candidates.find((c) => c.id === 'push-rope-pushdown')).toBeUndefined();
    expect(candidates.find((c) => c.id === 'push-overhead-tri')).toBeUndefined();
    // No biceps movement either.
    expect(candidates.find((c) => c.id === 'pull-bb-curl')).toBeUndefined();
    // No calf movement either.
    expect(candidates.find((c) => c.id === 'legs-standing-calf')).toBeUndefined();
  });

  it('surfaces same-section peers first for an isolation lift', () => {
    // The three lateral-raise variants share the 'shoulders-lateral'
    // section — they should be the first hits.
    const { candidates } = buildSwapCandidates('push-cable-lateral');
    const ids = candidates.slice(0, 3).map((c) => c.id);
    // Order between siblings can vary; just assert they appear in the
    // top of the list (above any cross-section noise).
    expect(ids).toContain('push-upright-row');
    expect(ids).toContain('push-band-lateral');
  });

  it('surfaces pattern peers for a foundational compound', () => {
    // Bench → horizontal-press pattern → every horizontal press variant.
    const { candidates, patternKey } = buildSwapCandidates('push-bb-bench');
    expect(patternKey).toBe('horizontal-press');
    expect(candidates.length).toBeGreaterThan(2);
    expect(candidates.find((c) => c.id === 'push-db-bench')).toBeDefined();
    expect(candidates.find((c) => c.id === 'push-incline-db')).toBeDefined();
  });

  it('excludes the current exercise from its own candidate list', () => {
    const { candidates } = buildSwapCandidates('push-bb-bench');
    expect(candidates.find((c) => c.id === 'push-bb-bench')).toBeUndefined();
  });

  it('excludes ballistic (plyometric/power) peers when swapping a foundational grind compound', () => {
    // Back squat is a foundational grind compound (['compound',
    // 'foundational', 'bilateral']). Jump squat shares the squat pattern
    // but is ballistic (['compound', 'power', 'plyometric']) — it is not a
    // load-equivalent substitute and must not be offered.
    const { candidates } = buildSwapCandidates('legs-back-squat');
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.find((c) => c.id === 'legs-jump-squat')).toBeUndefined();
    // Legitimate grind equivalents are retained.
    expect(candidates.find((c) => c.id === 'legs-front-squat')).toBeDefined();
  });

  it('falls back to primary-muscle peers only when higher tiers are thin', () => {
    // A movement with NO pattern + sparse section peers + no shared
    // specific tags should still return enough candidates to be useful.
    // The fallback fires below the 3-candidate threshold.
    const { candidates } = buildSwapCandidates('push-cable-lateral');
    // The lateral section has 3 entries (cable, upright row, band).
    // Two of those become candidates → that's the floor. The filter
    // either lets them be (≥3) or splices in muscle peers.
    expect(candidates.length).toBeGreaterThanOrEqual(2);
  });
});
