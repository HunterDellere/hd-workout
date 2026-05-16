// Voice — short epigraphs surfaced in the moments where copy can carry
// weight: the Today hero, the session-end title, Home in its rest-day
// shape, empty states for History and Insights.
//
// Tone: subtle, never preachy. No "crush it", no exclamation points,
// no second-person commands. The voice should feel like someone left a
// note in the margin of a notebook — half-quote, half-observation. If
// a line could appear in a fitness ad, it doesn't belong here.
//
// All lines are picked deterministically from the current date (or a
// provided seed) so each user sees the same line all day rather than a
// re-shuffle on every paint.

const PUSH = [
  'Movement is survival.',
  'Press the ground away.',
  'What you brace, you can build.',
  'Stand tall. Lift well. Repeat.',
];

const PULL = [
  'Strength through adversity.',
  'What you pull toward you, you keep.',
  'Length first. Then load.',
  'A back made of small honest days.',
];

const LEGS = [
  'Sturdy through the floor.',
  'Big rocks. Slow weeks. Long arc.',
  'Below the knee, the work is real.',
  'Ground up.',
];

const CORE = [
  'Hold the line.',
  'Stillness, under load, is strength.',
  'The middle decides what the ends can do.',
  'Breathe. Brace. Move.',
];

const RECOVERY = [
  'Tend the body you intend to keep.',
  'Small reps. Long horizon.',
  'What you maintain, you don\'t have to rebuild.',
  'Not every day breaks ground.',
];

const REST = [
  'A day off the floor.',
  'Idle hands, rebuilding tissue.',
  'Sharpen the saw.',
  'Rest is part of the lift.',
];

const SESSION_END_PR = [
  'Logged. Strength through adversity.',
  'Logged. New ground.',
  'Logged. The line moved.',
  'A heavier honest day.',
];

const SESSION_END_PLAIN = [
  'Logged. Movement is survival.',
  'Written down. That\'s the work.',
  'Another honest day.',
  'Logged. Tomorrow comes lighter.',
];

const HISTORY_EMPTY = [
  'No sessions yet. The notebook starts on your first lift.',
  'The page is blank — open Today and write a line.',
];

const INSIGHTS_EMPTY = [
  'Numbers want sets. Log a few and the picture sharpens.',
  'Patterns surface after a handful of sessions. Keep going.',
];

const HOME_ITALIC = [
  'Your training, written down.',
  'A notebook for the long arc.',
  'Built from honest days.',
];

const ALL = {
  push: PUSH,
  pull: PULL,
  legs: LEGS,
  core: CORE,
  recovery: RECOVERY,
  rest: REST,
  'session-end-pr': SESSION_END_PR,
  'session-end-plain': SESSION_END_PLAIN,
  'history-empty': HISTORY_EMPTY,
  'insights-empty': INSIGHTS_EMPTY,
  'home-italic': HOME_ITALIC,
};

// Deterministic pick — same seed → same line. The seed defaults to the
// current YYYY-MM-DD in the user's local timezone so a single day shows
// a single line, but the line rotates day to day.
function dayStamp(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Pick a line for the given bank. `seed` defaults to today; pass an
// alternate string (e.g. session id) for a different cadence.
export function voiceFor(bank, seed) {
  const list = ALL[bank];
  if (!list || list.length === 0) return null;
  const key = `${bank}:${seed ?? dayStamp()}`;
  return list[hash(key) % list.length];
}
