// Pattern-first view derived from the day-rooted catalog.
// Does not mutate `days`/`dayList`. Returned shape is a frozen map
// `{ [patternKey]: Exercise[] }` for the ten canonical patterns.
//
// Membership rules, in order, first match wins per (pattern, exercise):
//   1. explicit pattern tag on the exercise (e.g. 'horizontal-press')
//   2. section-key mapping (chest-horizontal → horizontal-press, etc.)
//   3. tag-based fallback (e.g. 'hinge' tag → hinge pattern)
//
// Heuristics are conservative: an exercise can belong to multiple patterns
// (e.g. a single-leg RDL is both hinge and lunge-adjacent). We accept that
// because the library is a discovery surface, not a workout planner.

import { dayList } from './index';

export const PATTERN_KEYS = [
  'horizontal-press',
  'vertical-press',
  'horizontal-pull',
  'vertical-pull',
  'squat',
  'hinge',
  'lunge',
  'core-anti',
  'core-flexion',
  'mobility',
];

// section.key → patterns this section primarily trains
const SECTION_TO_PATTERNS = {
  'chest-horizontal':  ['horizontal-press'],
  'chest-incline':     ['horizontal-press'],
  'shoulders-ohp':     ['vertical-press'],
  'shoulders-lateral': [], // isolation — not a primary pattern
  'shoulders-rotator': ['mobility'],
  'rear-delt':         [],
  'triceps':           [],
  'biceps':            [],
  'back-horizontal':   ['horizontal-pull'],
  'lats-vertical':     ['vertical-pull'],
  'back-erectors':     ['hinge'],
  'grip-forearms':     [],
  'quads-compound':    ['squat'],
  'quads-iso':         [],
  'hamstrings':        ['hinge'],
  'glutes':            ['hinge'],
  'adductors':         [],
  'calves':            [],
  'carries':           ['core-anti'],
  'anti-rotation':     ['core-anti'],
  'anti-extension':    ['core-anti'],
  'anti-lateral':      ['core-anti'],
  'rotation-power':    ['core-flexion'],
};

// Tag → pattern. Explicit pattern slugs first; semantic fallbacks after.
const TAG_TO_PATTERNS = {
  'horizontal-press': ['horizontal-press'],
  'vertical-press':   ['vertical-press'],
  'horizontal-pull':  ['horizontal-pull'],
  'vertical-pull':    ['vertical-pull'],
  'hinge':            ['hinge'],
  'unilateral':       ['lunge'],            // unilateral leg work is lunge-adjacent
  'anti-rotation':    ['core-anti'],
  'anti-extension':   ['core-anti'],
  'anti-lateral-flexion': ['core-anti'],
  'rotation':         ['core-flexion'],
  'rotator-cuff':     ['mobility'],
  'warm-up':          ['mobility'],
  'recovery':         ['mobility'],
};

function patternsForExercise(exercise, section) {
  const out = new Set();

  for (const tag of exercise.tags ?? []) {
    const direct = TAG_TO_PATTERNS[tag];
    if (direct) direct.forEach((p) => out.add(p));
  }

  const sectionMap = SECTION_TO_PATTERNS[section.key] ?? [];
  sectionMap.forEach((p) => out.add(p));

  // Unilateral lower-body lives only under lunge if it's actually a lower-body section.
  // Strip the lunge tag-assignment when the section is upper-body or core.
  const upperOrCore = section.key.startsWith('chest-')
    || section.key.startsWith('back-')
    || section.key.startsWith('shoulders-')
    || section.key === 'lats-vertical'
    || section.key === 'biceps'
    || section.key === 'triceps'
    || section.key === 'rear-delt'
    || section.key === 'grip-forearms'
    || section.key === 'anti-rotation'
    || section.key === 'anti-extension'
    || section.key === 'anti-lateral'
    || section.key === 'rotation-power'
    || section.key === 'carries';
  if (upperOrCore) out.delete('lunge');

  return [...out];
}

function freeze(obj) {
  Object.values(obj).forEach((v) => Object.freeze(v));
  return Object.freeze(obj);
}

// Pure: walks dayList and returns the pattern→exercises map.
// Exported as a function (not a memoized value) so tests can pass a fixture.
export function derivePatternToExercises(source = dayList) {
  const map = Object.fromEntries(PATTERN_KEYS.map((k) => [k, []]));
  const seen = new Map(); // key: `${pattern}::${exerciseId}` → true

  for (const day of source) {
    for (const section of day.sections) {
      for (const exercise of section.exercises) {
        const patterns = patternsForExercise(exercise, section);
        for (const p of patterns) {
          const k = `${p}::${exercise.id}`;
          if (seen.has(k)) continue;
          seen.set(k, true);
          map[p] = [
            ...map[p],
            { ...exercise, _section: { key: section.key, title: section.title }, _day: day.key },
          ];
        }
      }
    }
  }

  return freeze(map);
}

// Default memoized view over the bundled catalog.
let _cached = null;
export function patternToExercises() {
  if (!_cached) _cached = derivePatternToExercises();
  return _cached;
}

export function exercisesForPattern(patternKey) {
  return patternToExercises()[patternKey] ?? [];
}
