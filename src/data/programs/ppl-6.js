// PPL 6-day — Push / Pull / Legs, twice per week.
//
// Each muscle group gets two exposures per week, so per-session volume is
// lower than Full Spectrum (which trains each muscle group once per week
// with higher per-session volume). Same catalog ids — every PPL exercise
// already exists in the push / pull / legs catalog files. The program
// just selects a leaner cut and tightens prescriptions to match the
// twice-weekly cadence.
//
// Suggested split (the program exposes `defaultSplit`):
//   Mon Push · Tue Pull · Wed Legs · Thu Push · Fri Pull · Sat Legs · Sun Rest

export const ppl6 = {
  key: 'ppl-6',
  name: 'PPL 6-day',
  description:
    'Push / Pull / Legs, twice per week. Each session is leaner than '
    + 'Full Spectrum because every muscle group gets two exposures. Best '
    + 'when you can train six days and want frequency over per-session volume.',
  // The settings page reads this to offer a one-tap split swap when the
  // user activates the program. Day-of-week → day-key.
  defaultSplit: { 0: 'rest', 1: 'push', 2: 'pull', 3: 'legs', 4: 'push', 5: 'pull', 6: 'legs' },
  days: {
    push: {
      'chest-horizontal': [
        { id: 'push-bb-bench',      sets: '4 × 5–8',    rest: '2:30' },
        { id: 'push-db-bench',      sets: '3 × 8–12',   rest: '2:00' },
        { id: 'push-cable-fly-mid', sets: '3 × 12–15',  rest: '1:30' },
      ],
      'chest-incline': [
        { id: 'push-incline-db',    sets: '3 × 8–12',   rest: '2:00' },
      ],
      'shoulders-ohp': [
        { id: 'push-seated-db-ohp', sets: '4 × 6–10',   rest: '2:00' },
      ],
      'shoulders-lateral': [
        { id: 'push-cable-lateral', sets: '4 × 12–15',  rest: '1:00' },
      ],
      'shoulders-rotator': [
        { id: 'push-face-pull',     sets: '3 × 15–20',  rest: '1:00' },
      ],
      'triceps': [
        { id: 'push-rope-pushdown', sets: '3 × 10–15',  rest: '1:00' },
        { id: 'push-overhead-tri',  sets: '3 × 10–12',  rest: '1:30' },
        { id: 'push-skull-crusher', sets: '3 × 8–12',   rest: '1:30' },
      ],
    },
    pull: {
      'lats-vertical': [
        { id: 'pull-pullup',        sets: '4 × 5–10',   rest: '2:00' },
        { id: 'pull-lat-pulldown',  sets: '3 × 8–12',   rest: '1:30' },
      ],
      'back-horizontal': [
        { id: 'pull-cable-row',     sets: '4 × 8–12',   rest: '2:00' },
        { id: 'pull-db-row',        sets: '3 × 8–12 each side', rest: '1:30' },
      ],
      'back-erectors': [
        { id: 'pull-back-extension', sets: '3 × 12–15', rest: '1:30' },
      ],
      'biceps': [
        { id: 'pull-bb-curl',         sets: '3 × 8–12',  rest: '1:30' },
        { id: 'pull-incline-db-curl', sets: '3 × 10–12', rest: '1:30' },
        { id: 'pull-hammer-curl',     sets: '3 × 10–12', rest: '1:30' },
      ],
      'rear-delt': [
        { id: 'pull-rev-pec-deck',  sets: '3 × 12–15',  rest: '1:00' },
      ],
      'grip-forearms': [
        { id: 'pull-farmers-carry', sets: '3 × 40–60m', rest: '2:00' },
      ],
    },
    legs: {
      'quads-compound': [
        { id: 'legs-back-squat', sets: '4 × 5–8',         rest: '3:00' },
        { id: 'legs-leg-press',  sets: '3 × 8–15',        rest: '2:00' },
        { id: 'legs-bgss',       sets: '3 × 8–10 each',   rest: '2:00' },
      ],
      'quads-iso': [
        { id: 'legs-leg-extension', sets: '3 × 12–15', rest: '1:30' },
      ],
      'hamstrings': [
        { id: 'legs-rdl',          sets: '3 × 8–10',  rest: '2:30' },
        { id: 'legs-seated-curl',  sets: '3 × 10–12', rest: '1:30' },
      ],
      'glutes': [
        { id: 'legs-hip-thrust',     sets: '3 × 8–12',       rest: '2:00' },
        { id: 'legs-cable-kickback', sets: '3 × 12–15 each', rest: '1:00' },
        { id: 'legs-hip-abduction',  sets: '3 × 12–15',      rest: '1:00' },
      ],
      'adductors': [
        { id: 'legs-hip-adduction', sets: '3 × 12–15',  rest: '1:00' },
      ],
      'calves': [
        { id: 'legs-standing-calf', sets: '4 × 8–12',   rest: '1:30' },
        { id: 'legs-seated-calf',   sets: '3 × 12–15',  rest: '1:00' },
        { id: 'legs-tib-raise',     sets: '3 × 15–20',  rest: '1:00' },
      ],
    },
    // No dedicated Core day in PPL — anti-rotation/anti-extension work
    // happens within the carries + compound bracing of P/P/L.
    // No dedicated Recovery day in PPL — the rest day handles it.
  },
};

export default ppl6;
