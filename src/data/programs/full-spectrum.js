// Full Spectrum — the default program.
//
// Phase 4 slice 1: programming is now data, not code. This file specifies
// which catalog exercises (referenced by id) belong in each day/section,
// and the prescription (sets + rest) per exercise. The catalog files
// (push.js / pull.js / legs.js / core.js / recovery.js) define the
// *movements* — name, cues, safety, variants, tags. The program defines
// *how they are programmed*: order, dose, rest.
//
// Adding a new program (PPL, Upper/Lower) means writing another file of
// this shape and pointing the user's split at the new program's day keys.
// Forking is then a per-user overlay on top of one of these templates.

export const fullSpectrum = {
  key: 'full-spectrum',
  name: 'Full Spectrum',
  description:
    'The default. Five training days — Push, Pull, Legs, Core, Recovery — '
    + 'with rests interspersed. Designed for long-term build with no movement '
    + 'gaps and explicit corrective work.',
  // Day-of-week → day-key. Sun=0. Used when the user activates the program
  // from /me/settings to offer a one-tap "apply this program's split" affordance.
  defaultSplit: { 0: 'recovery', 1: 'push', 2: 'pull', 3: 'rest', 4: 'legs', 5: 'core', 6: 'rest' },
  days: {
    push: {
      // Trimmed default — one anchor compound + one accessory per section.
      // Swap/add affordances let you bring in variants. Goal: every section
      // is a focused menu, not a sprawl.
      'chest-horizontal': [
        { id: 'push-bb-bench',      sets: '4 × 5–8',    rest: '2:30–3:00' },
        { id: 'push-cable-fly-mid', sets: '3 × 10–15',  rest: '1:30' },
      ],
      'chest-incline': [
        { id: 'push-incline-db',    sets: '4 × 8–12',   rest: '2:00' },
      ],
      'shoulders-ohp': [
        { id: 'push-seated-db-ohp', sets: '4 × 6–10',   rest: '2:00–2:30' },
      ],
      'shoulders-lateral': [
        { id: 'push-cable-lateral', sets: '4 × 12–15',  rest: '1:00–1:30' },
      ],
      'shoulders-rotator': [
        { id: 'push-face-pull',     sets: '3 × 15–20',  rest: '1:00' },
        { id: 'push-cable-ext-rot', sets: '3 × 12–15',  rest: '1:00' },
      ],
      'triceps': [
        { id: 'push-rope-pushdown', sets: '3 × 10–15',  rest: '1:00' },
        { id: 'push-overhead-tri',  sets: '3 × 10–12',  rest: '1:30' },
      ],
    },
    pull: {
      'lats-vertical': [
        { id: 'pull-pullup',       sets: '4 × 5–10',  rest: '2:00–2:30' },
        { id: 'pull-lat-pulldown', sets: '4 × 8–12',  rest: '1:30–2:00' },
      ],
      'back-horizontal': [
        { id: 'pull-cable-row',    sets: '4 × 8–12',           rest: '2:00' },
        { id: 'pull-db-row',       sets: '3 × 8–12 each side', rest: '1:30–2:00' },
      ],
      'back-erectors': [
        { id: 'pull-deadlift',     sets: '3 × 3–6',   rest: '3:00–4:00' },
      ],
      'biceps': [
        { id: 'pull-bb-curl',       sets: '3 × 8–12',  rest: '1:30' },
        { id: 'pull-hammer-curl',   sets: '3 × 10–12', rest: '1:30' },
      ],
      'rear-delt': [
        { id: 'pull-rev-pec-deck', sets: '3 × 12–15', rest: '1:00' },
      ],
      'grip-forearms': [
        { id: 'pull-farmers-carry', sets: '3 × 40–60m', rest: '2:00' },
      ],
    },
    legs: {
      'quads-compound': [
        { id: 'legs-back-squat',   sets: '4 × 5–8',         rest: '3:00' },
        { id: 'legs-bgss',         sets: '3 × 8–10 each',   rest: '2:00' },
      ],
      'quads-iso': [
        { id: 'legs-leg-extension', sets: '3 × 12–15', rest: '1:30' },
      ],
      'hamstrings': [
        { id: 'legs-rdl',          sets: '4 × 8–10',  rest: '2:30' },
        { id: 'legs-seated-curl',  sets: '3 × 10–12', rest: '1:30' },
      ],
      'glutes': [
        { id: 'legs-hip-thrust',   sets: '4 × 8–12',  rest: '2:00' },
      ],
      'adductors': [
        { id: 'legs-copenhagen',   sets: '3 × 20–40 sec each', rest: '1:00' },
      ],
      'calves': [
        { id: 'legs-standing-calf', sets: '4 × 8–12',  rest: '1:30' },
        { id: 'legs-tib-raise',     sets: '3 × 15–20', rest: '1:00' },
      ],
      'carries': [
        { id: 'legs-suitcase-carry', sets: '3 × 30–40m each', rest: '1:30' },
      ],
    },
    core: {
      'anti-rotation': [
        { id: 'core-pallof',   sets: '3 × 10–12 each side', rest: '1:00' },
        { id: 'core-dead-bug', sets: '3 × 8–10 each side',  rest: '0:45' },
      ],
      'anti-extension': [
        { id: 'core-ab-wheel', sets: '3 × 6–10',      rest: '1:30' },
        { id: 'core-plank',    sets: '3 × 30–60 sec', rest: '1:00' },
      ],
      'anti-lateral': [
        { id: 'core-side-plank',    sets: '3 × 20–45 sec each', rest: '1:00' },
        { id: 'core-suitcase-hold', sets: '3 × 30–45 sec each', rest: '1:00' },
      ],
      'rotation-power': [
        { id: 'core-med-ball-throw', sets: '4 × 5 each side', rest: '1:30' },
      ],
    },
    recovery: {
      'posture': [
        { id: 'rec-band-pull-apart',    sets: '3 × 15–20',             rest: '0:45' },
        { id: 'rec-prone-ytw',          sets: '2 × 8 each shape',      rest: '1:00' },
        { id: 'rec-wall-slide',         sets: '2 × 10',                rest: '0:45' },
        { id: 'rec-chin-tuck',          sets: '3 × 10 (3-count hold)', rest: '0:30' },
        { id: 'rec-thoracic-extension', sets: '2 × 8',                 rest: '0:45' },
      ],
      'imbalance': [
        { id: 'rec-1arm-row', sets: '3 × 8–10 each arm', rest: '1:30' },
        { id: 'rec-1leg-rdl', sets: '3 × 8 each leg',    rest: '1:30' },
      ],
      'spine-health': [
        { id: 'rec-mcgill-curlup',    sets: '3 × 5 (10s holds, descending)',           rest: '0:30' },
        { id: 'rec-mcgill-sideplank', sets: '3 × 5 (10s holds, descending) each side', rest: '0:30' },
        { id: 'rec-bird-dog',         sets: '3 × 8 (5s holds) each side',              rest: '0:30' },
      ],
      'healthspan': [
        { id: 'rec-vo2-intervals', sets: '4 × 4 min (3 min recovery)', rest: '3:00' },
        { id: 'rec-dead-hang',     sets: '3 × max effort',             rest: '2:00' },
      ],
      'facial-cervical': [
        { id: 'rec-neck-flexion',   sets: '2 × 10 (3-count holds)', rest: '0:30' },
        { id: 'rec-neck-extension', sets: '2 × 10 (3-count holds)', rest: '0:30' },
      ],
      'stretching': [
        { id: 'rec-pigeon-stretch',    sets: '2 × 1 min each side',  rest: '0:30' },
        { id: 'rec-couch-stretch',     sets: '2 × 1 min each side',  rest: '0:30' },
        { id: 'rec-supine-hamstring',  sets: '2 × 45 sec each side', rest: '0:30' },
        { id: 'rec-doorway-pec',       sets: '2 × 30 sec each side', rest: '0:30' },
      ],
      'posture-practice': [
        { id: 'rec-wall-posture-check', sets: '2 × 1 min',  rest: '0:30' },
        { id: 'rec-ribs-down',          sets: '3 × 30 sec', rest: '0:30' },
      ],
      'balance': [
        { id: 'rec-single-leg-stand', sets: '2 × 1 min each side', rest: '0:30' },
      ],
      'soft-tissue': [
        { id: 'rec-foam-roll-tspine', sets: '2 × 2 min',           rest: '0:30' },
        { id: 'rec-lacrosse-glute',   sets: '2 × 2 min each side', rest: '0:30' },
      ],
      'mind-body': [
        { id: 'rec-sun-salutation-a', sets: '5 rounds', rest: '—' },
      ],
    },
  },
};

export default fullSpectrum;
