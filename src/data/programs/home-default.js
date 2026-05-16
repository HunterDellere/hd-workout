// Home — the default home program.
//
// Assumes: resistance bands, kettlebells (1–2), mace + club + pull-up bar,
// light dumbbells (3–6 lb), foam roller / yoga mat / foam blocks, and
// bodyweight. No power rack, no cable column, no machines, no barbell.
//
// Shape is the same as full-spectrum: same day-keys (push/pull/legs/core/
// recovery) and the same section-keys per day so the catalog renderer
// matches sections by key in lockstep. Movements are a tighter subset
// of A/S tier that work with the home equipment list.
//
// Sections per day are leaner than gym — at home you're usually not
// taking 90-minute sessions. Each day reads in about 35-50 minutes.

export const homeDefault = {
  key: 'home-default',
  name: 'Home — Full Spectrum',
  description:
    'A complete training arc for home: bands, kettlebells, mace/club, '
    + 'pull-up bar, and bodyweight. Same five days as the gym build — '
    + 'leaner sessions, same movement quality.',
  // Sun=0. Same default rotation as full-spectrum so the user feels
  // continuity when switching presets.
  defaultSplit: { 0: 'recovery', 1: 'push', 2: 'pull', 3: 'rest', 4: 'legs', 5: 'core', 6: 'rest' },
  days: {
    push: {
      'chest-horizontal': [
        { id: 'push-pushup',          sets: '4 × 8–15',    rest: '1:30' },
      ],
      'shoulders-ohp': [
        { id: 'push-kb-strict-press', sets: '4 × 6–10 each side', rest: '2:00' },
        { id: 'push-pike-pushup',     sets: '3 × 6–12',    rest: '1:30' },
      ],
      'shoulders-rotator': [
        // rec-band-pull-apart lives in recovery.js but is fully home-friendly
        { id: 'rec-band-pull-apart',  sets: '3 × 15–20',   rest: '1:00' },
      ],
    },
    pull: {
      'lats-vertical': [
        { id: 'pull-pullup',          sets: '4 × 5–10',    rest: '2:00' },
      ],
      'back-horizontal': [
        { id: 'pull-inverted-row',    sets: '4 × 8–15',    rest: '1:30' },
      ],
      'rear-delt': [
        { id: 'rec-band-pull-apart',  sets: '3 × 15–20',   rest: '1:00' },
      ],
      'grip-forearms': [
        { id: 'pull-farmers-carry',   sets: '3 × 40–60m (KBs)', rest: '1:30' },
      ],
    },
    legs: {
      'quads-compound': [
        { id: 'legs-goblet-squat',    sets: '4 × 8–15',    rest: '2:00' },
        { id: 'legs-bgss',            sets: '3 × 8–10 each side', rest: '1:30' },
      ],
      'hamstrings': [
        { id: 'legs-kb-swing',        sets: '5 × 15–20',   rest: '1:30' },
        { id: 'legs-sl-rdl',          sets: '3 × 8 each side', rest: '1:30' },
      ],
      'glutes': [
        { id: 'legs-glute-bridge',    sets: '3 × 12–20',   rest: '1:00' },
      ],
      'calves': [
        { id: 'legs-standing-calf',   sets: '4 × 12–20 (single-leg)', rest: '1:00' },
        { id: 'legs-tib-raise',       sets: '3 × 15–20',   rest: '1:00' },
      ],
    },
    core: {
      'anti-rotation': [
        { id: 'core-pallof',          sets: '3 × 10–12 each side (band)', rest: '1:00' },
        { id: 'core-dead-bug',        sets: '3 × 8–10 each side', rest: '0:45' },
      ],
      'anti-extension': [
        { id: 'core-plank',           sets: '3 × 30–60 sec', rest: '1:00' },
        { id: 'core-hollow-body',     sets: '3 × 20–40 sec', rest: '1:00' },
        { id: 'core-bear-crawl',      sets: '3 × 30–45 sec', rest: '1:00' },
      ],
      'anti-lateral': [
        { id: 'core-side-plank',      sets: '3 × 20–45 sec each', rest: '1:00' },
        { id: 'legs-suitcase-carry',  sets: '3 × 30s each side',  rest: '1:00' },
      ],
    },
    recovery: {
      'posture': [
        { id: 'rec-band-pull-apart',  sets: '3 × 15–20',           rest: '0:45' },
        { id: 'rec-prone-ytw',        sets: '2 × 8 each shape',    rest: '1:00' },
        { id: 'rec-wall-slide',       sets: '2 × 10',              rest: '0:45' },
        { id: 'rec-chin-tuck',        sets: '3 × 10 (3-count hold)', rest: '0:30' },
        { id: 'rec-thoracic-extension', sets: '2 × 8',             rest: '0:45' },
      ],
      'imbalance': [
        { id: 'rec-1arm-row',         sets: '3 × 8–10 each arm (KB or band)', rest: '1:30' },
        { id: 'legs-suitcase-carry',  sets: '3 × 30s each side',   rest: '1:00' },
        { id: 'legs-copenhagen',      sets: '2 × 20–30s each side', rest: '1:00' },
        { id: 'rec-1leg-rdl',         sets: '3 × 8 each leg',      rest: '1:30' },
      ],
      'spine-health': [
        { id: 'rec-mcgill-curlup',    sets: '3 × 5 (10s holds, descending)',           rest: '0:30' },
        { id: 'rec-mcgill-sideplank', sets: '3 × 5 (10s holds, descending) each side', rest: '0:30' },
        { id: 'rec-bird-dog',         sets: '3 × 8 (5s holds) each side',              rest: '0:30' },
        { id: 'core-dead-bug',        sets: '3 × 8 each side',                         rest: '0:45' },
        { id: 'rec-glute-bridge-brace', sets: '3 × 10 (3s holds)',                     rest: '0:45' },
      ],
      'healthspan': [
        { id: 'rec-zone-2-walk',      sets: '1 × 30–60 min',           rest: '—' },
        { id: 'rec-90-90-hip',        sets: '2 × 8 each direction',    rest: '0:30' },
        { id: 'rec-hip-cars',         sets: '2 × 5 each direction',    rest: '0:30' },
        { id: 'rec-thoracic-rotation', sets: '2 × 6–8 each side',      rest: '0:30' },
        { id: 'rec-dead-hang',        sets: '3 × max effort',          rest: '2:00' },
        { id: 'rec-heel-walk',        sets: '3 × 20 m',                rest: '0:30' },
      ],
      'facial-cervical': [
        { id: 'rec-neck-flexion',     sets: '2 × 10 (3-count holds)',  rest: '0:30' },
        { id: 'rec-neck-extension',   sets: '2 × 10 (3-count holds)',  rest: '0:30' },
        { id: 'rec-mewing',           sets: 'Practice throughout the day', rest: '—' },
      ],
    },
  },
};

export default homeDefault;
