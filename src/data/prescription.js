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
//   { kind: 'rounds',     rounds }
//   { kind: 'free-text',  raw }
//
// straight/pyramid expose `repsMid` and `setsTotal` so consumers don't
// need to discriminate when they just want the headline. duration/rounds
// carry a single `setsTotal` so progress + working-set counts still apply.

const SET_REPS_SEP = /\s*[×x]\s*/i;
const RANGE = /\s*[-–—]\s*/;
const PYRAMID = /^\s*\d+(?:\s*\/\s*\d+)+\s*$/;
// Time units: matches '30 sec', '30s', '2 min', '1.5 min'. Case-insensitive.
const TIME_UNIT = /^\s*(\d+(?:\.\d+)?)\s*(sec|second|seconds|s|min|minute|minutes|m)\b/i;
const ROUNDS = /^\s*(\d+)\s*(round|rounds|cycle|cycles|flow|flows)\b/i;
const PER_SIDE = /\b(each\s+side|per\s+side|each)\b/i;

function parseTimeToSeconds(text) {
  const m = String(text ?? '').match(TIME_UNIT);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2].toLowerCase();
  const isMin = unit.startsWith('m');
  return Math.round(n * (isMin ? 60 : 1));
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

  // Duration with sets prefix: '3 × 30 sec', '2 x 1 min each side'.
  if (SET_REPS_SEP.test(raw)) {
    const [setsPart, restPart] = raw.split(SET_REPS_SEP, 2);
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

  // Single duration without sets: '5 min', '30 sec each side'.
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
    const [setsPart, repsPart] = raw.split(SET_REPS_SEP, 2);
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
