// Swap candidate ranking — pure logic for SubstituteSheet.
//
// Extracted from src/components/SubstituteSheet.jsx so the relevance
// rules are testable in isolation. The component still owns layout,
// equipment-exclusion filtering, and the picker UX; this module just
// answers "given exercise X, which catalog peers should be offered?".
//
// Ranking (preserved order, de-duped by id):
//   1. Same movement pattern
//   2. Same catalog section
//   3. Shared specific (non-generic) tag
//   4. Same primary muscle — only added if 1+2+3 yielded < 3 candidates
//
// Generic tags ('compound', 'isolation', 'bilateral', etc.) are stripped
// before tag matching so that a single curl doesn't relate to every other
// curl, lateral raise, kickback, and tib raise in the catalog. Anatomical
// and pattern tags (medial-delt, long-head, hinge, horizontal-press, etc.)
// survive and do the real work.

import { exercisesForPattern, patternToExercises } from './derive';
import { findExerciseAnywhere, rawCatalogList } from './index';

function patternForExercise(exerciseId) {
  const map = patternToExercises();
  for (const [key, list] of Object.entries(map)) {
    if (list.some((e) => e.id === exerciseId)) return key;
  }
  return null;
}

export const GENERIC_TAGS = new Set([
  'compound', 'isolation',
  'bilateral', 'unilateral',
  'mobility', 'flexibility', 'corrective',
  'healthspan', 'foundational', 'prehab', 'warm-up',
  'bodyweight', 'machine', 'conditioning',
]);

const MUSCLE_PEER_FALLBACK_THRESHOLD = 3;

export function buildSwapCandidates(currentExerciseId) {
  const current = currentExerciseId ? findExerciseAnywhere(currentExerciseId) : null;
  if (!current) return { candidates: [], current: null, patternKey: null };

  const sectionKey = current.section?.key ?? null;
  const patternKey = patternForExercise(currentExerciseId);
  const currentTags = new Set(
    (current.exercise.tags ?? []).filter((t) => !GENERIC_TAGS.has(t)),
  );
  const currentPrimary = new Set(current.exercise.primaryMuscles ?? []);

  const out = [];
  const seen = new Set([currentExerciseId]);

  if (patternKey) {
    for (const ex of exercisesForPattern(patternKey)) {
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      out.push(ex);
    }
  }

  const catalog = rawCatalogList();
  const sectionPeers = [];
  const tagPeers = [];
  const musclePeers = [];
  for (const ex of catalog) {
    if (seen.has(ex.id)) continue;
    const sameSection = sectionKey && ex._section?.key === sectionKey;
    const sharedTag = currentTags.size > 0
      && (ex.tags ?? []).some((t) => !GENERIC_TAGS.has(t) && currentTags.has(t));
    if (sameSection) {
      sectionPeers.push(ex);
      seen.add(ex.id);
      continue;
    }
    if (sharedTag) {
      tagPeers.push(ex);
      seen.add(ex.id);
      continue;
    }
    if (currentPrimary.size > 0
        && (ex.primaryMuscles ?? []).some((m) => currentPrimary.has(m))) {
      musclePeers.push(ex);
    }
  }

  const primaryPool = [...out, ...sectionPeers, ...tagPeers];
  const candidates = primaryPool.length >= MUSCLE_PEER_FALLBACK_THRESHOLD
    ? primaryPool
    : [...primaryPool, ...musclePeers.filter((ex) => !seen.has(ex.id))];

  return { candidates, current, patternKey };
}
