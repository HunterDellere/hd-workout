// Parse a human prescription string into a structured shape the session UI
// can consume. Accepts:
//
//   '4 × 5–8'              → straight (sets × reps)
//   '3–4 × 8–12'           → straight with set range
//   '10/8/6/4'             → pyramid
//   '3 × 30 sec'           → duration (sets × hold-time)
//   '2 × 1 min each side'  → duration with per-side note
//   '5 min'                → duration (single hold)
//   '3 rounds'             → rounds (flow / sequence)
//
// Authored strings come from the static catalog so the parser is tolerant
// of en/em dashes, 'x'/'×', and ascii-only inputs.
//
// Outputs:
//   { kind: 'straight',   sets, repsLow, repsHigh }
//   { kind: 'pyramid',    setsPerRep: [reps, reps, ...] }
//   { kind: 'duration',   sets, holdSec, perSide }
//   { kind: 'duration',   sets, holdSec, holdSchedule: [sec, sec, ...] }
//   { kind: 'rounds',     rounds }
//   { kind: 'free-text',  raw }
//
// A 'duration' result may carry a `holdSchedule` — a per-set list of hold
// times (the McGill Big 3 descending ladder, '10/8/6/4/2s'). When present the
// timer steps its target down the list set by set; `holdSec` is the first
// (fallback) entry so consumers that ignore the schedule still see a target.
//
// straight/pyramid expose `repsMid` and `setsTotal` so consumers don't
// need to discriminate when they just want the headline. duration/rounds
// carry a single `setsTotal` so progress + working-set counts still apply.

const SET_REPS_SEP = /\s*[×x]\s*/i;
const RANGE = /\s*[-–—]\s*/;
const PYRAMID = /^\s*\d+(?:\s*\/\s*\d+)+\s*$/;
// Hold pyramid: a slash-separated list of hold times — '10/8/6/4/2s',
// '10/8/6/4/2 sec'. Distinguished from a reps pyramid ('10/8/6/4') by the
// trailing time unit. Each entry is one isometric hold and the timer steps
// the target down the list (the McGill Big 3 descending ladder). Matched
// anywhere in the string so authored prescriptions can carry a descriptive
// prefix like 'Descending holds: 10/8/6/4/2s'.
const HOLD_PYRAMID = /(\d+(?:\s*\/\s*\d+)+)\s*(?:s|sec|secs|second|seconds)\b/i;
// Time units: matches '30 sec', '30s', '2 min', '1.5 min'. The bare 'm'
// alias is intentionally restricted to the long-form spellings here —
// "min" / "minute(s)" — because a stand-alone "m" collides with the
// distance unit "meters" (see `parseDistanceToMeters`). Case-insensitive.
const TIME_UNIT = /^\s*(\d+(?:\.\d+)?)\s*(sec|second|seconds|s|min|minute|minutes)\b/i;
// Distance unit: '40m', '60 m', '40-60m'. Meters only — yards/feet are
// not used in any current catalog entry; revisit if that changes.
const DISTANCE_UNIT = /^\s*(\d+(?:\.\d+)?)\s*(m|meter|meters)\b/i;
const ROUNDS = /^\s*(\d+)\s*(round|rounds|cycle|cycles|flow|flows)\b/i;
const PER_SIDE = /\b(each\s+side|per\s+side|each)\b/i;
// "max effort" / "max" / "to failure" / "AMRAP" — any of these in the
// reps slot means "go until you can't" rather than a specific rep target.
// Surface routes these to the duration timer with no target (open-ended).
const OPEN_EFFORT = /\b(max\s+effort|max|to\s+failure|amrap)\b/i;

function parseTimeToSeconds(text) {
  const raw = String(text ?? '').trim();
  // Range form: "30–60 sec", "1–2 min". Use the high end as the target
  // so the lifter has the full window to hit before overtime kicks in.
  if (RANGE.test(raw)) {
    const [, b] = raw.split(RANGE, 2);
    // Pull the unit off the upper bound, then re-attach to the lower
    // bound so a bare "30" picks up the trailing unit's interpretation.
    const upper = parseTimeToSeconds(b);
    if (upper != null) return upper;
  }
  const m = raw.match(TIME_UNIT);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2].toLowerCase();
  const isMin = unit.startsWith('min') || unit.startsWith('minute');
  return Math.round(n * (isMin ? 60 : 1));
}

// Parse "40m" / "40–60m" / "60 meters" → { low, high } in meters.
// Range form takes the high end as the target (mirrors duration handling).
function parseDistanceToMeters(text) {
  const raw = String(text ?? '').trim();
  if (RANGE.test(raw)) {
    const [a, b] = raw.split(RANGE, 2);
    const aMatch = a.match(/^\s*(\d+(?:\.\d+)?)/);
    const bMatch = b.match(DISTANCE_UNIT);
    if (aMatch && bMatch) {
      const low = Number.parseFloat(aMatch[1]);
      const high = Number.parseFloat(bMatch[1]);
      if (Number.isFinite(low) && Number.isFinite(high)) return { low, high };
    }
  }
  const m = raw.match(DISTANCE_UNIT);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  return { low: n, high: n };
}

function parseRange(text, fallback) {
  if (text == null) return fallback;
  const trimmed = String(text).trim();
  if (!trimmed) return fallback;
  if (RANGE.test(trimmed)) {
    const [a, b] = trimmed.split(RANGE).map((n) => Number.parseInt(n, 10));
    if (Number.isFinite(a) && Number.isFinite(b)) return { low: a, high: b };
  }
  const single = Number.parseInt(trimmed, 10);
  if (Number.isFinite(single)) return { low: single, high: single };
  return fallback;
}

function midpoint(low, high) {
  return Math.round((low + high) / 2);
}

// Split on the first occurrence of SET_REPS_SEP. We can't use
// `String.split(regex, 2)` because that returns the first 2 chunks of
// an N-way split, which truncates strings like "3 × max effort" to
// ["3", "ma"] (the `x` in `max` is also a SET_REPS_SEP hit).
function splitFirstSetReps(raw) {
  const m = SET_REPS_SEP.exec(raw);
  if (!m) return null;
  return [raw.slice(0, m.index), raw.slice(m.index + m[0].length)];
}

export function parsePrescription(input) {
  if (input == null) return { kind: 'free-text', raw: '' };
  const raw = String(input).trim();
  if (!raw) return { kind: 'free-text', raw };

  // Rounds first — it shouldn't collide with × so test before sets-by-reps.
  const roundsMatch = raw.match(ROUNDS);
  if (roundsMatch) {
    const rounds = Number.parseInt(roundsMatch[1], 10);
    if (Number.isFinite(rounds)) {
      return { kind: 'rounds', rounds, setsTotal: rounds, raw };
    }
  }

  // Duration with sets prefix: '3 × 30 sec', '2 x 1 min each side',
  // '3 × 30–60 sec' (range, upper bound becomes the target).
  if (SET_REPS_SEP.test(raw)) {
    const [setsPart, restPart] = splitFirstSetReps(raw) ?? [null, null];
    const setsRange = parseRange(setsPart, null);
    const holdSec = parseTimeToSeconds(restPart);
    if (setsRange && holdSec != null) {
      return {
        kind: 'duration',
        sets: setsRange.high,
        setsTotal: setsRange.high,
        holdSec,
        perSide: PER_SIDE.test(restPart),
        raw,
      };
    }
  }

  // Distance with sets prefix: '3 × 40m', '4 × 40–60m', '3 × 30s each side'
  // for carries / walks / rucks. The lifter logs meters per round rather
  // than reps; the timer surface is suppressed (these are about distance,
  // not hold-time). Note: PER_SIDE handling identical to duration.
  if (SET_REPS_SEP.test(raw)) {
    const [setsPart, restPart] = splitFirstSetReps(raw) ?? [null, null];
    const setsRange = parseRange(setsPart, null);
    const distance = parseDistanceToMeters(restPart);
    if (setsRange && distance) {
      return {
        kind: 'distance',
        sets: setsRange.high,
        setsTotal: setsRange.high,
        distanceLow: distance.low,
        distanceHigh: distance.high,
        unit: 'm',
        perSide: PER_SIDE.test(restPart),
        raw,
      };
    }
  }

  // Open-effort with sets prefix: '3 × max effort', '3 × AMRAP'.
  // Routes to the duration timer with no target (open count-up) so the
  // lifter can hang / hold / row to exhaustion without a bogus reps input.
  if (SET_REPS_SEP.test(raw)) {
    const [setsPart, restPart] = splitFirstSetReps(raw) ?? [null, null];
    const setsRange = parseRange(setsPart, null);
    if (setsRange && OPEN_EFFORT.test(restPart)) {
      return {
        kind: 'duration',
        sets: setsRange.high,
        setsTotal: setsRange.high,
        holdSec: null, // open-ended — UI shows count-up with no target
        perSide: PER_SIDE.test(restPart),
        raw,
      };
    }
  }

  // Single duration without sets: '5 min', '30 sec each side',
  // '30–60 min' (range — upper bound is the target).
  const bareDuration = parseTimeToSeconds(raw);
  if (bareDuration != null) {
    return {
      kind: 'duration',
      sets: 1,
      setsTotal: 1,
      holdSec: bareDuration,
      perSide: PER_SIDE.test(raw),
      raw,
    };
  }

  // Hold pyramid: descending (or otherwise varying) isometric holds, e.g.
  // 'Descending holds: 10/8/6/4/2s'. Tested before the reps-pyramid and the
  // straight branches — both would otherwise mis-read the first number as a
  // rep target and route this to the weighted SetRow. Emits a weight-free
  // duration shape carrying the full schedule; DurationSetRow reads
  // holdSchedule[setIndex] so the hold time counts down set by set.
  const holdMatch = raw.match(HOLD_PYRAMID);
  if (holdMatch) {
    const holdSchedule = holdMatch[1].split('/').map((n) => Number.parseInt(n.trim(), 10));
    if (holdSchedule.length > 1 && holdSchedule.every(Number.isFinite)) {
      const perSide = PER_SIDE.test(raw);
      // Two-sided ladders (curl-up, side plank) run each rung on both sides
      // before stepping down — 10s L, 10s R, then 8s L, 8s R, … — so the
      // total hold count is twice the ladder length. DurationSetRow maps each
      // logged hold back to its rung.
      const setsTotal = perSide ? holdSchedule.length * 2 : holdSchedule.length;
      return {
        kind: 'duration',
        sets: setsTotal,
        setsTotal,
        holdSchedule,
        holdSec: holdSchedule[0],
        perSide,
        raw,
      };
    }
  }

  if (PYRAMID.test(raw)) {
    const setsPerRep = raw.split('/').map((n) => Number.parseInt(n.trim(), 10));
    if (setsPerRep.every(Number.isFinite)) {
      const low = Math.min(...setsPerRep);
      const high = Math.max(...setsPerRep);
      return {
        kind: 'pyramid',
        setsPerRep,
        setsTotal: setsPerRep.length,
        repsLow: low,
        repsHigh: high,
        repsMid: midpoint(low, high),
        raw,
      };
    }
  }

  if (SET_REPS_SEP.test(raw)) {
    const [setsPart, repsPart] = splitFirstSetReps(raw) ?? [null, null];
    const setsRange = parseRange(setsPart, null);
    const repsRange = parseRange(repsPart, null);
    if (setsRange && repsRange) {
      return {
        kind: 'straight',
        sets: setsRange.high, // use the higher end of '3–4 × 8' so the UI shows enough SetRows
        setsLow: setsRange.low,
        setsTotal: setsRange.high,
        repsLow: repsRange.low,
        repsHigh: repsRange.high,
        repsMid: midpoint(repsRange.low, repsRange.high),
        raw,
      };
    }
  }

  return { kind: 'free-text', raw };
}

// Parse a rest string into seconds. Accepts '2:30', '2:30–3:00', '90s', '90'.
// Returns { lowerBoundSec, upperBoundSec, raw }. Both bounds can be null.
const COLON_TIME = /^(\d+):(\d{1,2})$/;
const SECONDS = /^(\d+)\s*s?$/i;

function parseRestPart(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  const colon = trimmed.match(COLON_TIME);
  if (colon) return Number.parseInt(colon[1], 10) * 60 + Number.parseInt(colon[2], 10);
  const sec = trimmed.match(SECONDS);
  if (sec) return Number.parseInt(sec[1], 10);
  return null;
}

export function parseRest(input) {
  if (input == null) return { lowerBoundSec: null, upperBoundSec: null, raw: '' };
  const raw = String(input).trim();
  if (!raw) return { lowerBoundSec: null, upperBoundSec: null, raw };
  if (RANGE.test(raw)) {
    const [a, b] = raw.split(RANGE);
    return {
      lowerBoundSec: parseRestPart(a),
      upperBoundSec: parseRestPart(b),
      raw,
    };
  }
  const single = parseRestPart(raw);
  return { lowerBoundSec: single, upperBoundSec: single, raw };
}
