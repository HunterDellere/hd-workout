// Rest-day data: the calm-coach voice for non-training days.
// Active-rest options are suggestions, not prescriptions — pick by feel.

export const REST_DAY = {
  key: 'rest',
  name: 'Rest',
  subtitle: 'Active or full',
  description: 'No lifting today.',
};

// Wave 4.4 #9: trimmed from 8 numbered options to 3. The previous list
// read as a checklist of obligations, contradicting VISION's "hush of a
// Kinfolk page" framing. Three quiet options keep the door open without
// inviting compliance.
export const ACTIVE_REST_ACTIVITIES = [
  { key: 'walk',      name: 'Walk',          detail: '30–60 min, easy pace.' },
  { key: 'mobility',  name: 'Mobility flow', detail: '15–20 min through your stiffest joints.' },
  { key: 'outdoor',   name: 'Anything outdoors', detail: 'Hike, swim, bike, paddle — pick by weather.' },
];
