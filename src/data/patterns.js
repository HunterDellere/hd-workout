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
];

export const PATTERN_BY_KEY = Object.fromEntries(PATTERNS.map((p) => [p.key, p]));
