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
      'shoulders-rotator': [
        { id: 'push-face-pull',     sets: '3 × 12–15', rest: '1:00' },
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
      'quads-compound': [
        { id: 'legs-back-squat',     sets: '4 × 5–8',           rest: '3:00' },
        { id: 'legs-bgss',           sets: '3 × 8–10 each side', rest: '1:30' },
      ],
      'hamstrings': [
        { id: 'legs-rdl',            sets: '3 × 6–10',          rest: '2:30' },
      ],
      'glutes': [
        { id: 'legs-hip-thrust',     sets: '3 × 8–12',          rest: '2:00' },
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
        { id: 'rec-mcgill-curlup',    sets: '3 × 10/8/6/4/2s descending holds',      rest: '0:30' },
        { id: 'rec-mcgill-sideplank', sets: '3 × 10/8/6/4/2s descending each side',  rest: '0:30' },
        { id: 'rec-bird-dog',         sets: '3 × 8 (5s holds) each side',            rest: '0:30' },
      ],
      'healthspan': [
        // Norwegian 4×4 VO2max protocol — the single most-studied
        // intervention for longevity. Pairs with the dead hang
        // (shoulder girdle health) and Zone 2 walks (mitochondrial
        // base).
        { id: 'rec-vo2-intervals',   sets: '4 × 4 min (3 min recovery)', rest: '3:00' },
        { id: 'rec-zone-2-walk',     sets: '1 × 30–60 min',              rest: '—' },
        { id: 'rec-dead-hang',       sets: '3 × max effort',             rest: '2:00' },
      ],
      'stretching': [
        { id: 'rec-pigeon-stretch',  sets: '2 × 1 min each side',        rest: '0:30' },
        { id: 'rec-couch-stretch',   sets: '2 × 1 min each side',        rest: '0:30' },
        { id: 'rec-doorway-pec',     sets: '2 × 30 sec each side',       rest: '0:30' },
      ],
      'balance': [
        { id: 'rec-single-leg-stand', sets: '2 × 1 min each side',       rest: '0:30' },
      ],
    },
  },
};

export default longevity;
