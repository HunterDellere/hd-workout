// Cross-cutting training principles + injury prevention.
// Surfaced on the home screen and (concisely) elsewhere in the app.

export const principles = [
  {
    id: 'p-progressive-overload',
    title: 'Progressive Overload',
    body:
      'The body adapts only to demands it has not yet met. Add weight, reps, or quality '
      + 'across weeks. If the bar moves the same way for a month, the body has nothing '
      + 'to respond to.',
    tags: ['stimulus', 'programming'],
  },
  {
    id: 'p-full-rom',
    title: 'Full Range of Motion',
    body:
      'Stretched-position training drives hypertrophy. Half reps build half a muscle. '
      + 'Lower the weight before you shorten the range.',
    tags: ['hypertrophy', 'form'],
  },
  {
    id: 'p-tempo',
    title: 'Tempo Matters',
    body:
      'A slow eccentric (3 seconds) creates more disruption than a fast one. Time '
      + 'under tension matters more than total reps.',
    tags: ['form', 'hypertrophy'],
  },
  {
    id: 'p-symmetry',
    title: 'Train Unilaterally',
    body:
      'Bilateral lifts mask asymmetries. Single-arm, single-leg work reveals and '
      + 'fixes the imbalance that will otherwise become an injury.',
    tags: ['unilateral', 'longevity'],
  },
  {
    id: 'p-recovery',
    title: 'Recovery Is The Stimulus',
    body:
      'Adaptation happens in sleep and feeding, not in the gym. 7+ hours sleep, '
      + 'protein at 0.7–1g per lb bodyweight, adequate calories.',
    tags: ['recovery', 'lifestyle'],
  },
  {
    id: 'p-warm-up',
    title: 'Warm Up Before You Load',
    body:
      'Five minutes of general movement, then 2–3 ramping sets of the first lift. '
      + 'A cold body lifts smaller and gets hurt more.',
    tags: ['warm-up', 'injury-prevention'],
  },
];

export const injuryPrevention = [
  {
    id: 'i-rotator-cuff',
    title: 'Rotator Cuff Every Push',
    body:
      'Face pulls and external rotations every single push session. The cuff '
      + 'is the brake; if it fails, the joint fails. Light loads, strict form.',
    severity: 'high',
  },
  {
    id: 'i-adductors',
    title: 'Strong Adductors',
    body:
      'Copenhagen planks and adduction machine work prevent groin strains and '
      + 'support knee tracking. Five minutes a week is enough.',
    severity: 'medium',
  },
  {
    id: 'i-tibialis',
    title: 'Tibialis Training',
    body:
      'Balances the calf complex and prevents shin splints. Direct tib raises '
      + 'reverse a lifetime of plantarflexion bias.',
    severity: 'medium',
  },
  {
    id: 'i-hinge',
    title: 'Hinge Pattern Drilling',
    body:
      'Most lower-back injuries are RDL or deadlift form failures under load. '
      + 'Film yourself from the side every working set.',
    severity: 'high',
  },
  {
    id: 'i-mobility',
    title: 'Daily Hip + T-Spine Mobility',
    body:
      'Five minutes a day. 90/90 hip switches, thoracic openers, ankle CARs. '
      + 'Mobility is built outside the gym, not inside it.',
    severity: 'medium',
  },
  {
    id: 'i-brace',
    title: '360° Brace',
    body:
      'Big breath into the belly — expand sides and back, not just the front. '
      + 'Brace BEFORE the load, hold the brace, exhale through pursed lips on '
      + 'the way up.',
    severity: 'high',
  },
];
