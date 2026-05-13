// Rest-day data: the calm-coach voice for non-training days.
// Active-rest options are suggestions, not prescriptions — pick by feel.

export const REST_DAY = {
  key: 'rest',
  name: 'Rest',
  subtitle: 'Active or full',
  description:
    'No prescribed lifting today. Move if it feels useful; sit still if it doesn\'t. '
    + 'The training only works when the rest works.',
};

export const ACTIVE_REST_ACTIVITIES = [
  {
    key: 'walk',
    name: 'Walk',
    detail: '30–60 min, easy pace. Outside if you can.',
  },
  {
    key: 'hike',
    name: 'Hike',
    detail: 'Trail or hills. Low-stress aerobic; bring water.',
  },
  {
    key: 'swim',
    name: 'Swim',
    detail: 'Easy laps or open water. Shoulder-friendly aerobic work.',
  },
  {
    key: 'kayak',
    name: 'Kayak',
    detail: 'Flat water or sea, paddle without pushing. Counts as upper-back recovery.',
  },
  {
    key: 'bike',
    name: 'Easy bike',
    detail: 'Conversational pace. Spin out the legs without loading them.',
  },
  {
    key: 'ping-pong',
    name: 'Ping pong',
    detail: 'Or any racquet sport. Sharpen reflexes without taxing the system.',
  },
  {
    key: 'yoga',
    name: 'Yoga',
    detail: 'Gentle flow or yin. Skip the intensity; chase the position.',
  },
  {
    key: 'mobility',
    name: 'Mobility flow',
    detail: '15–20 min through your stiffest joints. Hips, T-spine, ankles.',
  },
];
