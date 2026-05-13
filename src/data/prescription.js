// Parse a human prescription string like '4 × 5–8' or '3–4 × 8–12' or
// '10/8/6/4' into a structured shape the session UI can consume.
//
// Input strings come from the static catalog (push.js / pull.js / etc.) where
// they were authored for human reading. We do not require strict formatting —
// the parser is tolerant of en-dashes, em-dashes, regular hyphens, and
// 'x'/'×' as the sets-by-reps separator.
//
// Outputs:
//   { kind: 'straight',   sets, repsLow, repsHigh }
//   { kind: 'pyramid',    setsPerRep: [reps, reps, ...] }
//   { kind: 'free-text',  raw }  // anything we can't parse — UI falls back
//
// Both kinds expose `repsMid` (rounded midpoint of the working range) and
// `setsTotal` (count of working sets) so consumers don't need to discriminate
// when they just want the headline.

const SET_REPS_SEP = /\s*[×x]\s*/i;
const RANGE = /\s*[-–—]\s*/;
const PYRAMID = /^\s*\d+(?:\s*\/\s*\d+)+\s*$/;

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
