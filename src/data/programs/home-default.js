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
        // Home adds a KB floor press as the heavier horizontal anchor;
        // pure bodyweight push-ups cap out fast for stronger lifters.
        { id: 'push-kb-floor-press',  sets: '3 × 8–12 each side', rest: '1:30' },
      ],
      'chest-incline': [
        // Was missing entirely at home — decline push-up is the
        // bodyweight upper-chest analog.
        { id: 'push-decline-pushup',  sets: '3 × 6–12',    rest: '1:30' },
      ],
      'shoulders-ohp': [
        { id: 'push-kb-strict-press', sets: '4 × 6–10 each side', rest: '2:00' },
        { id: 'push-pike-pushup',     sets: '3 × 6–12',    rest: '1:30' },
      ],
      'shoulders-rotator': [
        // rec-band-pull-apart lives in recovery.js but is fully home-friendly
        { id: 'rec-band-pull-apart',  sets: '3 × 15–20',   rest: '1:00' },
      ],
      'shoulders-lateral': [
        { id: 'push-band-lateral',    sets: '3 × 12–20',   rest: '1:00' },
      ],
      'triceps': [
        { id: 'push-band-pushdown',   sets: '3 × 12–15',   rest: '1:00' },
      ],
    },
    pull: {
      'lats-vertical': [
        { id: 'pull-pullup',          sets: '4 × 5–10',           rest: '2:00' },
        // Band-resisted lat pulldown for the days when the pull-up
        // bar isn't available or after pull-ups have been wrung out.
        { id: 'pull-band-pulldown',   sets: '3 × 10–15',          rest: '1:30' },
      ],
      'back-horizontal': [
        { id: 'pull-inverted-row',    sets: '4 × 8–15',           rest: '1:30' },
        // KB row is the single-arm anchor for home horizontal pull.
        // Heavier loading than a band, more honest than an inverted
        // row chain.
        { id: 'pull-kb-row',          sets: '3 × 8–12 each side', rest: '1:30' },
      ],
      'biceps': [
        { id: 'pull-kb-curl',         sets: '3 × 8–12 each side', rest: '1:30' },
      ],
      'rear-delt': [
        { id: 'rec-band-pull-apart',  sets: '3 × 15–20',          rest: '1:00' },
      ],
      'grip-forearms': [
        { id: 'pull-farmers-carry',   sets: '3 × 40–60m (KBs)',   rest: '1:30' },
        // Towel hang adds the grip-endurance side that farmers
        // carries underdose at home weights.
        { id: 'pull-towel-hang',      sets: '3 × max effort',     rest: '2:00' },
      ],
    },
    legs: {
      'quads-compound': [
        { id: 'legs-goblet-squat',         sets: '4 × 8–15',           rest: '2:00' },
        // Heavier double-bell variant for when the goblet caps out;
        // pure home progression toward more load on the squat.
        { id: 'legs-kb-double-front-squat', sets: '3 × 6–10',          rest: '2:00' },
        { id: 'legs-bgss',                  sets: '3 × 8–10 each side', rest: '1:30' },
      ],
      'adductors': [
        // Cossack already authored — wire it into home for the
        // adductor stretch under load.
        { id: 'legs-cossack-squat',         sets: '3 × 6 each side',    rest: '1:30' },
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
      // Curated 10-movement recovery day for home — Zone 2 walk
      // outdoors + dead hang on the home pull-up bar + mobility +
      // balance. Other catalog options (neck work, soft-tissue,
      // posture practice) are available via "+ Add exercise" so
      // the program doesn't try to do everything by default.
      'posture': [
        { id: 'rec-band-pull-apart', sets: '3 × 15–20',             rest: '0:45' },
        { id: 'rec-wall-slide',      sets: '2 × 10',                rest: '0:45' },
      ],
      'imbalance': [
        { id: 'rec-1arm-row', sets: '3 × 8–10 each arm (KB or band)', rest: '1:30' },
      ],
      'spine-health': [
        { id: 'rec-bird-dog', sets: '3 × 8 (5s holds) each side', rest: '0:30' },
      ],
      'healthspan': [
        { id: 'rec-zone-2-walk', sets: '1 × 30–60 min', rest: '—' },
        { id: 'rec-dead-hang',   sets: '3 × max effort', rest: '2:00' },
      ],
      'stretching': [
        { id: 'rec-pigeon-stretch',  sets: '2 × 1 min each side',  rest: '0:30' },
        { id: 'rec-couch-stretch',   sets: '2 × 1 min each side',  rest: '0:30' },
        { id: 'rec-doorway-pec',     sets: '2 × 30 sec each side', rest: '0:30' },
      ],
      'balance': [
        { id: 'rec-single-leg-stand', sets: '2 × 1 min each side', rest: '0:30' },
      ],
      'mind-body': [
        { id: 'rec-sun-salutation-a', sets: '5 rounds', rest: '—' },
      ],
    },
  },
};

export default homeDefault;
