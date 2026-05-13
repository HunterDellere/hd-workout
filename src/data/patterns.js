// Movement-pattern metadata: label + one-sentence description in the
// calm-coach voice. Order is the canonical display order across the app.
//
// Co-located with derive.js because both files read against the same
// PATTERN_KEYS set; importing label/description from a shared module keeps
// Library and LibraryPattern in lockstep.

export const PATTERNS = [
  {
    key: 'horizontal-press',
    label: 'Horizontal Press',
    description: 'Pressing a load away from the torso along a horizontal line. Bench work, dips, push-ups — anything that loads the pecs, anterior delts, and triceps through full extension.',
  },
  {
    key: 'vertical-press',
    label: 'Vertical Press',
    description: 'Driving a load overhead. The shoulders carry the work, the trunk braces against it. Done well, it deepens overhead capacity without grinding the cuff.',
  },
  {
    key: 'horizontal-pull',
    label: 'Horizontal Pull',
    description: 'Drawing a load toward the torso along a horizontal line. Rows in their many forms — the structural counterweight to all the pressing.',
  },
  {
    key: 'vertical-pull',
    label: 'Vertical Pull',
    description: 'Pulling a load down to the torso, or pulling the torso up to a fixed bar. Lats and mid-back lead; grip and elbows close the chain.',
  },
  {
    key: 'squat',
    label: 'Squat',
    description: 'Knee-dominant lower-body work. Hips and knees flex together; the spine stays long. Depth is earned by mobility, not forced by ego.',
  },
  {
    key: 'hinge',
    label: 'Hinge',
    description: 'Hip-dominant lower-body work. The hips travel back; the spine holds neutral. Deadlifts and their kin — where the posterior chain learns to fire as one piece.',
  },
  {
    key: 'lunge',
    label: 'Lunge',
    description: 'Unilateral lower-body work. One leg drives, the other stabilises. Reveals asymmetries no bilateral lift will show you.',
  },
  {
    key: 'core-anti',
    label: 'Core — Anti-rotation',
    description: 'Bracing the trunk against forces that want to twist or bend it. The job is to not move — the strength shows up everywhere else.',
  },
  {
    key: 'core-flexion',
    label: 'Core — Flexion',
    description: 'Trunk flexion and rotational power. Used in measured doses: the spine is built to hold, not to repeatedly fold.',
  },
  {
    key: 'mobility',
    label: 'Mobility',
    description: 'Active range work — warmups, joint preparation, recovery shapes. Quiet between the heavy sets, but it decides what the heavy sets can become.',
  },
];

export const PATTERN_BY_KEY = Object.fromEntries(PATTERNS.map((p) => [p.key, p]));
