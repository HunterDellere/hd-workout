// Movement-pattern metadata: label + one-sentence description.
// Co-located with derive.js because both files read against the same
// PATTERN_KEYS set.

export const PATTERNS = [
  {
    key: 'horizontal-press',
    label: 'Horizontal Press',
    description: 'Pressing away from the chest. Bench variants, dips, push-ups.',
  },
  {
    key: 'vertical-press',
    label: 'Vertical Press',
    description: 'Pressing overhead. Shoulders lead; the trunk braces.',
  },
  {
    key: 'horizontal-pull',
    label: 'Horizontal Pull',
    description: 'Rows. The counterweight to all the pressing.',
  },
  {
    key: 'vertical-pull',
    label: 'Vertical Pull',
    description: 'Pull-downs and pull-ups. Lats and mid-back lead.',
  },
  {
    key: 'squat',
    label: 'Squat',
    description: 'Knee-dominant lower body. Hips and knees flex together.',
  },
  {
    key: 'hinge',
    label: 'Hinge',
    description: 'Hip-dominant lower body. Deadlifts and their kin.',
  },
  {
    key: 'lunge',
    label: 'Lunge',
    description: 'Unilateral lower body. Reveals side-to-side gaps.',
  },
  {
    key: 'core-anti',
    label: 'Core — Anti-rotation',
    description: 'Bracing the trunk against forces that want to twist it.',
  },
  {
    key: 'core-flexion',
    label: 'Core — Flexion',
    description: 'Trunk flexion and rotational power. Used sparingly.',
  },
  {
    key: 'mobility',
    label: 'Mobility',
    description: 'Active range work. Warmups, joint prep, recovery shapes.',
  },
  {
    key: 'corrective',
    label: 'Corrective',
    description:
      'Posture, imbalance, and joint-health work. Pull-aparts, Y-T-W, '
      + 'wall slides, McGill big three. Small loads, big returns over time.',
  },
  {
    key: 'healthspan',
    label: 'Healthspan',
    description:
      'Longevity-leaning work that compounds: VO2 intervals, hip mobility, '
      + 'grip strength, ankle dorsiflexion, neck training.',
  },
];

export const PATTERN_BY_KEY = Object.fromEntries(PATTERNS.map((p) => [p.key, p]));

// Intent describes what role an exercise plays inside a workout, separate
// from which muscles or movement pattern it trains. Used by /today to
// render the section progression (warmup before main before finisher)
// and by the SlotPicker to filter alternates appropriately.
export const INTENTS = {
  warmup:     { key: 'warmup',     label: 'Warmup',     order: 0, hint: 'Raise heart rate, prime joints.' },
  activation: { key: 'activation', label: 'Activation', order: 1, hint: 'Wake up under-firing muscles before the main work.' },
  main:       { key: 'main',       label: 'Main',       order: 2, hint: 'The session’s headline work.' },
  accessory:  { key: 'accessory',  label: 'Accessory',  order: 3, hint: 'Support the main movements; address weak links.' },
  corrective: { key: 'corrective', label: 'Corrective', order: 4, hint: 'Posture, imbalance, and joint-health work.' },
  finisher:   { key: 'finisher',   label: 'Finisher',   order: 5, hint: 'Capacity, conditioning, or burnout sets.' },
};

export const INTENT_ORDER = Object.values(INTENTS)
  .sort((a, b) => a.order - b.order)
  .map((i) => i.key);

// Categories are content tags that don't fit cleanly into pattern or intent
// — they describe what kind of long-term benefit the exercise drives.
// Used by the catalog filter on the slot picker.
export const CATEGORIES = {
  posture:     { key: 'posture',     label: 'Posture',           hint: 'Counter forward-head, rounded-shoulder, kyphotic posture.' },
  imbalance:   { key: 'imbalance',   label: 'Imbalance',         hint: 'Unilateral and asymmetry work.' },
  healthspan:  { key: 'healthspan',  label: 'Healthspan',        hint: 'Longevity-leaning capacity and joint health.' },
  facial:      { key: 'facial',      label: 'Facial & cervical', hint: 'Neck, jaw, and tongue-posture training.' },
  spine:       { key: 'spine',       label: 'Spine health',      hint: 'Neutral-spine bracing. Spondy-friendly.' },
  grip:        { key: 'grip',        label: 'Grip',              hint: 'Forearm and hand strength.' },
  cardio:      { key: 'cardio',      label: 'Cardio',            hint: 'Aerobic capacity and conditioning. VO2 intervals, zone-2 work, intervals.' },
  mobility:    { key: 'mobility',    label: 'Mobility',          hint: 'Active range of motion and joint prep.' },
};

