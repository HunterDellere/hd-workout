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
      warmup: [
        { id: 'rec-band-pull-apart',   sets: '2 × 15',           rest: '0:20' },
        { id: 'push-light-db-y-raise', sets: '2 × 8 each',       rest: '0:20' },
        { id: 'rec-thoracic-rotation', sets: '6 each side',      rest: '0:20' },
      ],
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
        // Twice-weekly pressing frequency raises the cuff dose required
        // to keep up. Face pull + ext-rot every push session — non-
        // negotiable for a high-frequency build.
        { id: 'push-face-pull',     sets: '3 × 15–20',           rest: '1:00' },
        { id: 'push-cable-ext-rot', sets: '2 × 12–15 each side', rest: '0:45' },
      ],
      'triceps': [
        { id: 'push-rope-pushdown', sets: '3 × 10–15',  rest: '1:00' },
        { id: 'push-overhead-tri',  sets: '3 × 10–12',  rest: '1:30' },
        { id: 'push-skull-crusher', sets: '3 × 8–12',   rest: '1:30' },
      ],
    },
    pull: {
      warmup: [
        { id: 'rec-thoracic-rotation', sets: '6 each side',      rest: '0:20' },
        { id: 'rec-band-pull-apart',   sets: '2 × 15',           rest: '0:20' },
        { id: 'rec-bird-dog',          sets: '2 × 6 each side',  rest: '0:20' },
      ],
      'lats-vertical': [
        { id: 'pull-pullup',        sets: '4 × 5–10',   rest: '2:00' },
        { id: 'pull-lat-pulldown',  sets: '3 × 8–12',   rest: '1:30' },
      ],
      'back-horizontal': [
        { id: 'pull-cable-row',     sets: '4 × 8–12',   rest: '2:00' },
        { id: 'pull-db-row',        sets: '3 × 8–12 each side', rest: '1:30' },
      ],
      'back-erectors': [
        // Deadlift restored as the anchor hip hinge. Twice-weekly pull
        // frequency means each session is leaner — the deadlift sits at
        // 3×3–6 (low volume, high quality) so it doesn't compete with the
        // legs-day RDL or squat for recovery. Back-extension is a
        // legitimate accessory but it is not a true hinge replacement.
        { id: 'pull-deadlift',       sets: '3 × 3–6',   rest: '3:00' },
        { id: 'pull-back-extension', sets: '2 × 12–15', rest: '1:30' },
      ],
      'biceps': [
        { id: 'pull-bb-curl',         sets: '3 × 8–12',  rest: '1:30' },
        { id: 'pull-incline-db-curl', sets: '3 × 10–12', rest: '1:30' },
        { id: 'pull-hammer-curl',     sets: '3 × 10–12', rest: '1:30' },
      ],
      'rear-delt': [
        { id: 'pull-rev-pec-deck',    sets: '3 × 12–15', rest: '1:00' },
        { id: 'pull-cable-rear-delt', sets: '3 × 12–15', rest: '1:00' },
      ],
      'grip-forearms': [
        { id: 'pull-farmers-carry', sets: '3 × 40–60m', rest: '2:00' },
        // Wrist flexor balance: farmers train the crush grip; wrist
        // curl trains the flexors under stretch. Cheap insurance against
        // medial elbow tendinopathy under the higher pulling frequency.
        { id: 'pull-wrist-curl',    sets: '2 × 12–15',  rest: '1:00' },
      ],
    },
    legs: {
      warmup: [
        { id: 'rec-hip-cars',          sets: '5 each direction each side', rest: '0:20' },
        { id: 'rec-ankle-cars',        sets: '5 circles each direction each side', rest: '0:20' },
        { id: 'core-dead-bug',         sets: '2 × 6 each side',  rest: '0:20' },
      ],
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
        // Copenhagen builds the adductor under stretch — a single hip
        // adduction machine set leaves the muscle short and chronically
        // tight, a leading driver of groin strain in twice-weekly leg work.
        { id: 'legs-hip-adduction', sets: '3 × 12–15',          rest: '1:00' },
        { id: 'legs-copenhagen',    sets: '2 × 20–40 sec each', rest: '1:00' },
      ],
      'calves': [
        { id: 'legs-standing-calf', sets: '4 × 8–12',   rest: '1:30' },
        { id: 'legs-seated-calf',   sets: '3 × 12–15',  rest: '1:00' },
        { id: 'legs-tib-raise',     sets: '3 × 15–20',  rest: '1:00' },
      ],
      // Mini core finisher on each legs day — there is no dedicated core
      // day in PPL, so the trunk work lives at the end of the lower-body
      // session where compound bracing has already warmed the area.
      'carries': [
        { id: 'legs-suitcase-carry', sets: '3 × 30–40m each', rest: '1:00' },
      ],
    },
    // Optional recovery day — PPL's rest day is the natural slot for Zone 2
    // walks + dead hangs + spine maintenance. Kept lean (8 movements) so
    // it never competes with the six strength days for time. The user
    // can swap their `rest` day to `recovery` in the split when they
    // want the active dose; both days resolve to the same template.
    recovery: {
      'posture': [
        { id: 'rec-band-pull-apart', sets: '3 × 15–20', rest: '0:45' },
      ],
      'spine-health': [
        // Spine maintenance is the missing piece in a high-frequency PPL —
        // six pressing/pulling/squatting sessions per week tax the trunk
        // hard. McGill Big 3 once a week is the floor.
        { id: 'rec-mcgill-curlup',    sets: '3 × 10/8/6/4/2s descending holds', rest: '0:30' },
        { id: 'rec-mcgill-sideplank', sets: '3 × 10/8/6/4/2s descending each side', rest: '0:30' },
        { id: 'rec-bird-dog',         sets: '3 × 8 (5s holds) each side',        rest: '0:30' },
      ],
      'healthspan': [
        // Zone 2 first (60-min sustainable walk/cycle) — the aerobic base
        // that the strength-only build chronically underdoses. VO2
        // intervals are optional add-on; most PPL trainees won't have
        // the recovery headroom for both, so Zone 2 is the anchor.
        { id: 'rec-zone-2-walk',      sets: '1 × 30–60 min',           rest: '—' },
        { id: 'rec-dead-hang',        sets: '3 × max effort',          rest: '2:00' },
        { id: 'rec-finger-extension', sets: '2 × 15–20 each hand',     rest: '0:30' },
      ],
      'stretching': [
        { id: 'rec-pigeon-stretch',   sets: '2 × 1 min each side',     rest: '0:30' },
        { id: 'rec-couch-stretch',    sets: '2 × 1 min each side',     rest: '0:30' },
      ],
    },
  },
};

export default ppl6;
