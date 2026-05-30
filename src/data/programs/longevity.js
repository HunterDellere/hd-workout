// Longevity — healthspan-oriented program.
//
// Built around the four pillars consistent across the modern
// healthspan literature (Attia, Galpin, Phillips, Lyon):
//
//   1. Strength: enough to outlive frailty. Big compounds, low
//      volume, high quality. Squat, hinge, press, pull, carry.
//   2. Aerobic capacity: VO2max + Zone 2. The single strongest
//      mortality predictor across decades of cohort studies.
//   3. Stability: balance, single-leg work, grip. The fall
//      prevention layer.
//   4. Mobility: keep ROM through the joints you'll need at 80.
//
// The split rotates four training days plus three deliberate
// recovery / capacity days. Strength sessions are short (~30-40
// min) and dense; the cardio + mobility days are protected
// blocks that don't compete with strength recovery.
//
//   Sun  · recovery (mobility + Zone 2)
//   Mon  · push      (strength compounds, low volume)
//   Tue  · core      (carries + anti-rotation under load)
//   Wed  · recovery  (VO2max intervals)
//   Thu  · pull      (strength compounds, low volume)
//   Fri  · legs      (squat / hinge anchors)
//   Sat  · rest
//
// The user can flip the split in Settings. This is the default
// arrangement that best preserves strength recovery between
// heavy compound days.

export const longevity = {
  key: 'longevity',
  name: 'Longevity',
  description:
    'Healthspan-first. Strength to outlive frailty, VO2max + Zone 2 '
    + 'cardio, heavy carries, dead hangs, balance, and mobility. Low '
    + 'volume, high quality — the "centenarian decathlon" anchored '
    + 'into a sustainable week.',
  defaultSplit: {
    0: 'recovery', // Sun  · mobility + Zone 2
    1: 'push',     // Mon  · upper press
    2: 'core',     // Tue  · carries + anti-rotation
    3: 'recovery', // Wed  · VO2max intervals (rec-vo2-intervals)
    4: 'pull',     // Thu  · upper pull
    5: 'legs',     // Fri  · squat + hinge
    6: 'rest',     // Sat
  },
  days: {
    push: {
      // Strength minimums: one heavy horizontal press, one heavy
      // vertical press, one quality lateral. Skip chest accessories
      // and tricep isolation — they don't move the longevity needle.
      warmup: [
        { id: 'rec-arm-circles',       sets: '2 × 10 each direction', rest: '0:15' },
        { id: 'rec-thoracic-rotation', sets: '6 each side',           rest: '0:15' },
        { id: 'rec-cat-cow',           sets: '8 cycles',              rest: '0:15' },
      ],
      'shoulders-rotator': [
        // Rotator-cuff work is non-negotiable on every push day per the
        // injury-prevention rules — face pull hits posterior cuff + scap
        // retractors, ext-rot trains true external rotation under light
        // load. Two low-cost movements buy decades of shoulder health.
        { id: 'push-face-pull',      sets: '3 × 12–15', rest: '1:00' },
        { id: 'push-cable-ext-rot',  sets: '2 × 12–15 each side', rest: '0:45' },
      ],
      'chest-horizontal': [
        { id: 'push-bb-bench',      sets: '3 × 5–8',   rest: '2:30' },
      ],
      'shoulders-ohp': [
        { id: 'push-seated-db-ohp', sets: '3 × 6–10',  rest: '2:00' },
      ],
      'shoulders-lateral': [
        { id: 'push-cable-lateral', sets: '3 × 10–15', rest: '1:00' },
      ],
      'triceps': [
        // One tricep movement, kept for elbow health under pressing
        // volume — not for hypertrophy.
        { id: 'push-overhead-tri',  sets: '2 × 10–12', rest: '1:30' },
      ],
    },
    pull: {
      // Pull session prioritizes the deadlift pattern (posterior
      // chain + trunk + grip — the most healthspan-dense lift) and
      // anti-pulldowns (shoulder girdle health).
      warmup: [
        { id: 'rec-cat-cow',           sets: '8 cycles',              rest: '0:15' },
        { id: 'rec-thoracic-rotation', sets: '6 each side',           rest: '0:15' },
        { id: 'rec-walkouts',          sets: '6 reps',                rest: '0:20' },
      ],
      'lats-vertical': [
        { id: 'pull-pullup',         sets: '3 × 5–10',          rest: '2:00' },
      ],
      'back-horizontal': [
        { id: 'pull-cable-row',      sets: '3 × 8–12',          rest: '2:00' },
      ],
      'back-erectors': [
        { id: 'pull-deadlift',       sets: '3 × 3–6',           rest: '3:00' },
      ],
      'rear-delt': [
        { id: 'pull-rev-pec-deck',   sets: '2 × 12–15',         rest: '1:00' },
      ],
      'biceps': [
        { id: 'pull-hammer-curl',    sets: '2 × 10–12',         rest: '1:00' },
      ],
      'grip-forearms': [
        // Farmer carry is the single best longevity lift — grip,
        // posture, trunk, breath, all under load.
        { id: 'pull-farmers-carry',  sets: '4 × 40–60m',        rest: '2:00' },
      ],
    },
    legs: {
      warmup: [
        { id: 'rec-leg-swings',        sets: '10 each direction each leg', rest: '0:15' },
        { id: 'rec-hip-cars',          sets: '5 each direction each side', rest: '0:15' },
        { id: 'rec-ankle-cars',        sets: '5 circles each direction each side', rest: '0:15' },
      ],
      'quads-compound': [
        { id: 'legs-back-squat',     sets: '4 × 5–8',           rest: '3:00' },
        { id: 'legs-bgss',           sets: '3 × 8–10 each side', rest: '1:30' },
      ],
      'hamstrings': [
        // Hamstring volume bumped to 4 sets and paired with a seated curl.
        // The longevity build pulls deadlift out of pull day (frequency
        // trade-off) so the hinge load needs to live on legs day to
        // protect posterior-chain resilience as the lifter ages.
        { id: 'legs-rdl',            sets: '4 × 6–10',          rest: '2:30' },
        { id: 'legs-seated-curl',    sets: '2 × 10–12',         rest: '1:30' },
      ],
      'glutes': [
        { id: 'legs-hip-thrust',     sets: '3 × 8–12',          rest: '2:00' },
        // Glute medius drives lateral hip stability — directly tied to
        // fall prevention and IT-band/knee health into later decades.
        { id: 'legs-hip-abduction',  sets: '2 × 12–15',         rest: '1:00' },
      ],
      'adductors': [
        // Groin strain is one of the most common late-life injuries.
        // Copenhagen builds the adductor under stretch — cheap insurance.
        { id: 'legs-copenhagen',     sets: '2 × 20–40 sec each', rest: '1:00' },
      ],
      'calves': [
        // Tib raise is the no-fall lift — anterior shin strength
        // is what catches you when you trip. Healthspan staple.
        { id: 'legs-tib-raise',      sets: '3 × 15–20',         rest: '1:00' },
        { id: 'legs-standing-calf',  sets: '3 × 10–15',         rest: '1:30' },
      ],
      'carries': [
        { id: 'legs-suitcase-carry', sets: '3 × 30–40m each',   rest: '1:30' },
      ],
    },
    core: {
      // Tuesday's "core" day in this build is really a heavy-carry +
      // anti-rotation block. Two short carries + planks + an
      // overhead carry for shoulder integrity under load.
      warmup: [
        { id: 'rec-cat-cow',           sets: '8 cycles',              rest: '0:15' },
        { id: 'rec-thoracic-rotation', sets: '6 each side',           rest: '0:15' },
      ],
      'anti-rotation': [
        { id: 'core-pallof',         sets: '3 × 10–12 each side', rest: '1:00' },
        { id: 'core-dead-bug',       sets: '3 × 8–10 each side',  rest: '0:45' },
      ],
      'anti-extension': [
        { id: 'core-plank',          sets: '3 × 30–60 sec',       rest: '1:00' },
      ],
      'anti-lateral': [
        { id: 'core-side-plank',     sets: '3 × 30–45 sec each',  rest: '1:00' },
        { id: 'core-suitcase-hold',  sets: '3 × 30–45 sec each',  rest: '1:00' },
      ],
      'rotation-power': [
        { id: 'core-med-ball-throw', sets: '4 × 5 each side',     rest: '1:30' },
      ],
    },
    recovery: {
      // Recovery day in the longevity build is the cardio + mobility
      // engine. VO2max intervals + Zone 2 walks + dead hang +
      // mobility flows. This is where the healthspan markers move.
      'posture': [
        { id: 'rec-band-pull-apart', sets: '3 × 15–20',                  rest: '0:45' },
        { id: 'rec-wall-slide',      sets: '2 × 10',                     rest: '0:45' },
      ],
      'spine-health': [
        // McGill Big 3 — non-negotiable on a longevity build. Spine
        // resilience is what lets the centenarian still pick up a
        // grandchild. Trained in McGill's published order.
        { id: 'rec-mcgill-curlup',    sets: 'Descending holds: 10/8/6/4/2s',         rest: '0:10' },
        { id: 'rec-mcgill-sideplank', sets: 'Descending holds: 10/8/6/4/2s',         rest: '0:10' },
        { id: 'rec-bird-dog',         sets: '8 × 5 sec each side',                   rest: '0:10' },
      ],
      'healthspan': [
        // Norwegian 4×4 VO2max protocol — the single most-studied
        // intervention for longevity. Pairs with the dead hang
        // (shoulder girdle health) and Zone 2 walks (mitochondrial
        // base).
        { id: 'rec-vo2-intervals',   sets: '4 × 4 min (3 min recovery)', rest: '3:00' },
        { id: 'rec-zone-2-walk',     sets: '1 × 30–60 min',              rest: '—' },
        // Joint CARs — the silent healthspan layer. Hip capsule and
        // ankle dorsiflexion lose ROM first and force compensations
        // up the chain. These are 2-minute additions that compound
        // across decades.
        { id: 'rec-hip-cars',        sets: '2 × 5 each direction each side', rest: '0:30' },
        { id: 'rec-ankle-cars',      sets: '2 × 5 circles each direction each side', rest: '0:30' },
        { id: 'rec-dead-hang',       sets: '3 × max effort',             rest: '2:00' },
        // Grip and finger health is a healthspan staple — grip strength
        // is one of the strongest mortality predictors across cohorts.
        // Rice bucket rebuilds the whole forearm omnidirectionally;
        // finger extension catches the extensor imbalance that drives
        // late-life tendinopathy.
        { id: 'rec-rice-bucket',      sets: '2 × 60–90 sec each hand',    rest: '0:30' },
        { id: 'rec-finger-extension', sets: '2 × 15–20 each hand',        rest: '0:30' },
      ],
      'stretching': [
        { id: 'rec-pigeon-stretch',  sets: '2 × 1 min each side',        rest: '0:30' },
        { id: 'rec-couch-stretch',   sets: '2 × 1 min each side',        rest: '0:30' },
        { id: 'rec-doorway-pec',     sets: '2 × 30 sec each side',       rest: '0:30' },
      ],
      'balance': [
        { id: 'rec-single-leg-stand', sets: '2 × 1 min each side',       rest: '0:30' },
      ],
      'facial-cervical': [
        // Cervical strength preserves head-righting reflex and reduces
        // late-life dizziness and forward-head posture. Healthspan staple.
        { id: 'rec-neck-flexion',    sets: '2 × 10–15', rest: '0:30' },
        { id: 'rec-neck-extension',  sets: '2 × 10–15', rest: '0:30' },
      ],
    },
  },
};

export default longevity;
