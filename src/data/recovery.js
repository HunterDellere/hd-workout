// RECOVERY day :: posture, imbalance, healthspan, facial / cervical, spine health.
//
// This is a real, selectable workout — not a rest day. Use it on a low-energy
// day in place of training, or split a session by pulling 2–3 exercises from
// here into the warmup/corrective slots of a regular day.
//
// Every exercise carries:
//   - `intent`     — warmup | activation | main | corrective | finisher
//   - `categories` — posture / imbalance / healthspan / facial / spine / grip
//
// The category tags map to `corrective` and `healthspan` patterns in
// derive.js, so these exercises show up in the library's pattern browse.

const recovery = {
  key: 'recovery',
  name: 'Recovery',
  subtitle: 'Posture · Imbalance · Healthspan',
  description:
    'A real workout for the things lifting alone won’t fix: posture under '
    + 'modern desk loads, side-to-side imbalances, joint healthspan, '
    + 'cervical strength, and a spine-safe core. Light loads, deliberate '
    + 'execution, big returns over years.',
  // Render order tuned for a standalone recovery session:
  //   1. Posture practice — wake up neutral, set the frame
  //   2. Soft tissue — release before lengthening
  //   3. Stretching — earned ROM under length
  //   4. Posture (corrective) — pull-aparts / Ys against the daily curl
  //   5. Balance & proprioception — joint sensors, calm but engaged
  //   6. Imbalance — unilateral asymmetry work
  //   7. Spine health — McGill big-3 bracing
  //   8. Mind-body flows — sequenced movement
  //   9. Healthspan — cardio/VO2 + grip
  //  10. Facial & cervical — small finisher work
  defaultSectionOrder: [
    'posture-practice',
    'soft-tissue',
    'stretching',
    'posture',
    'balance',
    'imbalance',
    'spine-health',
    'mind-body',
    'healthspan',
    'facial-cervical',
  ],
  sections: [

    // ─── Posture ──────────────────────────────────────────────────────────
    {
      key: 'posture',
      title: 'Posture',
      blurb:
        'Counter forward-head and rounded-shoulder posture. The cumulative '
        + 'dose of these is what matters — small loads, frequent reps.',
      exercises: [
        {
          id: 'rec-band-pull-apart',
          name: 'Band Pull-Apart',
          tier: 'S',
          intent: 'corrective',
          categories: ['posture'],
          equipment: ['Light resistance band'],
          primaryMuscles: ['Rear deltoids', 'Mid-trapezius', 'Rhomboids'],
          secondaryMuscles: ['Rotator cuff'],
          cues: [
            'Arms straight, band at chest height',
            'Pull the band apart by squeezing the shoulder blades together',
            'Wrists stay neutral — don’t lead with the hands',
            'Slow eccentric: 1 count out, 2 counts back',
            'Keep ribs down; no lower-back extension to "cheat" range',
          ],
          safetyNotes: [
            'Start with the lightest band you own; this is high-rep, low-load by design.',
          ],
          variants: [
            { name: 'Pronated grip', note: 'Palms-down; biases mid-trap.' },
            { name: 'Supinated grip', note: 'Palms-up; biases lower-trap and external rotators.' },
            { name: 'Overhead pull-apart', note: 'Arms overhead; harder, biases lower-trap.' },
          ],
          tags: ['corrective', 'posture', 'warm-up'],
        },
        {
          id: 'rec-prone-ytw',
          name: 'Prone Y-T-W',
          tier: 'S',
          intent: 'corrective',
          categories: ['posture'],
          equipment: ['Flat bench or floor', 'Optional: 1–2 kg light plates'],
          primaryMuscles: ['Lower trapezius', 'Mid-trapezius', 'Rear deltoids'],
          secondaryMuscles: ['Rotator cuff'],
          cues: [
            'Lie face-down on a bench, arms hanging',
            'Y: lift arms overhead at ~45° angle, thumbs up — squeeze low-traps',
            'T: arms straight out to the sides, thumbs up',
            'W: bend elbows, externally rotate; squeeze mid-back',
            'Lift from the shoulder blades, not the arms — the load is tiny',
          ],
          safetyNotes: [
            'No load is the default. Add weight only when 8 reps each shape feel trivially easy.',
            'If you feel it in the upper-traps, lower the load and lift less high.',
          ],
          variants: [
            { name: 'Floor Y-T-W', note: 'No bench — slightly less ROM but same intent.' },
            { name: 'Incline-bench Y-T-W', note: '30° incline; longer arm hang.' },
          ],
          tags: ['corrective', 'posture', 'warm-up'],
        },
        {
          id: 'rec-wall-slide',
          name: 'Wall Slide',
          tier: 'S',
          intent: 'corrective',
          categories: ['posture', 'mobility'],
          equipment: ['Flat wall'],
          primaryMuscles: ['Lower trapezius', 'Serratus anterior'],
          secondaryMuscles: ['Rotator cuff'],
          cues: [
            'Heels, hips, upper back, and head all touching the wall',
            'Forearms and back of the hands pressed flat into the wall',
            'Slide arms up overhead while maintaining all contact points',
            'If contact breaks, you’ve hit your ROM — return',
            'Squeeze armpits "down and back" at the bottom; reach tall at the top',
          ],
          safetyNotes: [
            'No painful clicks or pinches. If shoulders complain, reduce ROM.',
          ],
          variants: [
            { name: 'Foam-roller wall slide', note: 'Hands on a vertical foam roller against the wall — drives serratus.' },
            { name: 'Banded wall slide', note: 'Light band around wrists; resists arm flare.' },
          ],
          tags: ['corrective', 'posture', 'warm-up', 'mobility'],
        },
        {
          id: 'rec-chin-tuck',
          name: 'Chin Tuck',
          tier: 'A',
          intent: 'corrective',
          categories: ['posture', 'facial'],
          equipment: ['Wall or floor'],
          primaryMuscles: ['Deep neck flexors (longus colli)'],
          secondaryMuscles: ['Upper cervical extensors'],
          cues: [
            'Stand or lie supine with head neutral',
            'Imagine making a "double chin" — retract the head straight back, not down',
            'Eyes stay level; no nodding',
            'Hold 3 counts, release',
            'You should feel the front of the neck working, not the back',
          ],
          safetyNotes: [
            'No pain at the base of the skull. If you feel it there, you’re nodding instead of retracting.',
          ],
          variants: [
            { name: 'Supine chin tuck', note: 'Lying on the floor; gravity gives feedback.' },
            { name: 'Wall chin tuck', note: 'Back of head against wall — push head into wall for cleaner cue.' },
          ],
          tags: ['corrective', 'posture', 'facial'],
        },
        {
          id: 'rec-thoracic-extension',
          name: 'Foam Roller Thoracic Extension',
          tier: 'A',
          intent: 'warmup',
          categories: ['posture', 'mobility'],
          equipment: ['Foam roller'],
          primaryMuscles: ['Thoracic erectors'],
          secondaryMuscles: ['Lats'],
          cues: [
            'Foam roller across the mid-back, perpendicular to the spine',
            'Hands behind the head, elbows pulled together',
            'Extend over the roller — let the upper back arch back',
            'Each "rep" is one extension at one spinal level',
            'Move the roller up the spine 1–2 inches between sets',
          ],
          safetyNotes: [
            'Never roll over the lower back. Stop at the bottom of the rib cage.',
            'If you feel pinching, you’ve gone past your range — back off.',
          ],
          variants: [
            { name: 'Bench thoracic extension', note: 'Upper back on a bench edge — bigger ROM.' },
          ],
          tags: ['corrective', 'posture', 'warm-up', 'mobility'],
        },
      ],
    },

    // ─── Imbalance ────────────────────────────────────────────────────────
    {
      key: 'imbalance',
      title: 'Imbalance',
      blurb:
        'Asymmetry work. Train one side at a time and you find — and fix — '
        + 'the gap. Always start with the weaker side; match it on the strong side.',
      exercises: [
        {
          id: 'rec-1arm-row',
          name: 'Single-Arm Dumbbell Row',
          tier: 'S',
          intent: 'main',
          categories: ['imbalance'],
          equipment: ['Dumbbell', 'Flat bench'],
          primaryMuscles: ['Lats', 'Mid-trapezius', 'Rhomboids'],
          secondaryMuscles: ['Biceps', 'Rear deltoid'],
          cues: [
            'One knee and hand on the bench; back flat, parallel to the floor',
            'Pull the dumbbell to the hip, not the chest',
            'Elbow drives back and up — lat-first',
            'No torso rotation; hip stays square to the floor',
            'Start with the weaker side; match reps on the strong side',
          ],
          safetyNotes: [
            'If reps drop off on the strong side, lower the load — don’t cheat with body english.',
          ],
          variants: [
            { name: 'Chest-supported 1-arm row', note: 'No anti-rotation demand; pure lat focus.' },
            { name: 'Meadows row', note: 'Landmine, staggered stance; bigger ROM.' },
          ],
          tags: ['imbalance', 'unilateral', 'horizontal-pull'],
        },
        // Suitcase carry + Copenhagen Plank are canonical in legs.js
        // (legs-suitcase-carry, legs-copenhagen). Recovery program
        // references those ids directly.
        {
          id: 'rec-1leg-rdl',
          name: 'Single-Leg Romanian Deadlift',
          tier: 'S',
          intent: 'main',
          categories: ['imbalance'],
          equipment: ['Dumbbell or kettlebell'],
          primaryMuscles: ['Hamstrings', 'Glute max'],
          secondaryMuscles: ['Glute medius', 'Erectors', 'Foot stabilizers'],
          cues: [
            'Weight in the opposite hand of the standing leg',
            'Hinge at the hip — back leg swings up as torso comes down',
            'Body forms a T at the bottom; back stays flat',
            'Eyes track 6 ft in front of the standing foot',
            'Stand the leg up, don’t pull with the back',
          ],
          safetyNotes: [
            'Master the bodyweight version before loading. Balance failure under load is how you lose teeth.',
          ],
          variants: [
            { name: 'Bodyweight 1-leg RDL', note: 'No load; pure balance + pattern.' },
            { name: 'B-stance RDL', note: 'Back foot lightly touches floor; less balance demand.' },
            { name: 'Kickstand RDL', note: 'Back foot on a 2-inch riser; 80 % loaded on the working leg.' },
          ],
          tags: ['imbalance', 'unilateral', 'hinge'],
        },
      ],
    },

    // ─── Spine health ─────────────────────────────────────────────────────
    {
      key: 'spine-health',
      title: 'Spine Health',
      blurb:
        'Stuart McGill’s Big 3 plus the dead bug and braced glute bridge. '
        + 'Neutral-spine bracing builds the kind of core that protects the back — '
        + 'spondylolisthesis-friendly when executed cleanly.',
      exercises: [
        {
          id: 'rec-mcgill-curlup',
          name: 'McGill Curl-Up',
          tier: 'S',
          intent: 'corrective',
          categories: ['spine'],
          equipment: ['Mat'],
          primaryMuscles: ['Rectus abdominis', 'Obliques'],
          secondaryMuscles: ['Deep cervical flexors'],
          cues: [
            'Supine; one knee bent, one leg straight (swap halfway)',
            'Hands under the lower back to maintain the natural lumbar curve',
            'Lift head and shoulders ONLY — no rounding',
            'Brace the entire trunk; act as one rigid unit',
            'Descending holds: 10s, 8s, 6s, 4s, 2s. Rest 10s between',
          ],
          safetyNotes: [
            'Designed by McGill specifically to train the core WITHOUT spinal flexion.',
            'If you feel it in the lower back, you’re rounding instead of bracing — start over.',
            'Excellent for spondylolisthesis and disc-issue populations.',
          ],
          variants: [
            { name: 'Elbow lift variant', note: 'Push elbows into the floor to amplify the brace.' },
          ],
          tags: ['corrective', 'spine-health', 'anti-extension', 'core-anti'],
        },
        {
          id: 'rec-mcgill-sideplank',
          name: 'McGill Side Plank',
          tier: 'S',
          intent: 'corrective',
          categories: ['spine'],
          equipment: ['Mat'],
          primaryMuscles: ['Quadratus lumborum', 'Obliques'],
          secondaryMuscles: ['Glute medius'],
          cues: [
            'Side plank from the knees (or feet for advanced)',
            'Top arm across the chest; bottom forearm flat',
            'Body in a straight line — no hip sag or hike',
            'Hold the brace; breathe through the diaphragm, not the chest',
            'Descending holds: 10/8/6/4/2s. Rest 10s between',
          ],
          safetyNotes: [
            'Knee version is the default. Foot version is for athletes with no back history.',
            'Stop if pain at the SI joint or lower back.',
          ],
          variants: [
            { name: 'Side plank with reach-through', note: 'Add anti-rotation; advanced.' },
          ],
          tags: ['corrective', 'spine-health', 'anti-lateral-flexion', 'core-anti'],
        },
        {
          id: 'rec-bird-dog',
          name: 'Bird Dog',
          tier: 'S',
          intent: 'corrective',
          categories: ['spine'],
          equipment: ['Mat'],
          primaryMuscles: ['Spinal erectors', 'Glute max', 'Multifidus'],
          secondaryMuscles: ['Obliques', 'Deltoid'],
          cues: [
            'Quadruped; hands under shoulders, knees under hips',
            'Extend opposite arm and leg until parallel to the floor',
            'Hips stay square — imagine a glass of water on the lower back',
            'Squeeze the glute of the extended leg at the top',
            '5-second hold per rep; switch sides',
          ],
          safetyNotes: [
            'Move slow. Speed is how you lose the brace and let the lower back arch.',
            'McGill cornerstone — single best safe extensor and glute trainer for compromised backs.',
          ],
          variants: [
            { name: 'Bird dog with crunch', note: 'Bring elbow to knee under the body between reps — full McGill protocol.' },
          ],
          tags: ['corrective', 'spine-health', 'anti-rotation', 'core-anti'],
        },
        // Dead bug is canonical in core.js (core-dead-bug). Recovery
        // program references that id directly.
        {
          id: 'rec-glute-bridge-brace',
          name: 'Braced Glute Bridge',
          tier: 'A',
          intent: 'activation',
          categories: ['spine', 'posture'],
          equipment: ['Mat'],
          primaryMuscles: ['Glute max'],
          secondaryMuscles: ['Hamstrings', 'Spinal erectors'],
          cues: [
            'Supine; knees bent, feet flat, hip-width',
            'Posterior pelvic tilt FIRST — tuck the tailbone',
            'Drive through heels to lift hips; finish with the glutes, not the back',
            'Top: knee-hip-shoulder in a line, glutes squeezed',
            'Hold 3 counts; descend with control',
          ],
          safetyNotes: [
            'If you feel it in the hamstrings or low back, you’re extending the back instead of squeezing the glutes.',
            'The PPT cue is the whole game.',
          ],
          variants: [
            { name: 'Single-leg glute bridge', note: 'Unilateral; bigger demand and balance check.' },
            { name: 'Hip thrust', note: 'Upper back on a bench; larger ROM, heavier load.' },
          ],
          tags: ['corrective', 'spine-health', 'posture', 'activation', 'hinge'],
        },
      ],
    },

    // ─── Healthspan ───────────────────────────────────────────────────────
    {
      key: 'healthspan',
      title: 'Healthspan',
      blurb:
        'The capacities that decline first and compound the most. Train them '
        + 'now and you keep them for decades.',
      exercises: [
        {
          id: 'rec-vo2-intervals',
          name: 'VO2-Style Intervals',
          tier: 'S',
          intent: 'finisher',
          categories: ['healthspan', 'cardio'],
          equipment: ['Bike, rower, or running surface'],
          primaryMuscles: ['Cardiac output', 'Type-II oxidative fibres'],
          secondaryMuscles: [],
          cues: [
            '4 minutes at ~85–95 % effort — hard but sustainable for the full 4',
            '3 minutes easy recovery between',
            'Repeat 4 times — this is the Norwegian 4×4 protocol',
            'Heart rate target: top of zone 4 / bottom of zone 5',
            'Once a week is plenty; once every 10 days is fine',
          ],
          safetyNotes: [
            'Have a cardiac baseline before doing high-intensity intervals if you’re over 35 or detrained.',
            'The recovery phase is part of the protocol — don’t skip it to "save time".',
          ],
          variants: [
            { name: '30-30s', note: '30s hard / 30s easy × 12. Lower joint impact; same V̇O₂ benefit.' },
            { name: '4×8 zone 2', note: 'Substitute when accumulated fatigue is high.' },
          ],
          tags: ['healthspan', 'conditioning'],
        },
        {
          id: 'rec-90-90-hip',
          name: '90-90 Hip Mobility',
          tier: 'A',
          intent: 'warmup',
          categories: ['healthspan', 'mobility'],
          equipment: ['Mat'],
          primaryMuscles: ['Hip internal rotators', 'Hip external rotators'],
          secondaryMuscles: ['Glute medius'],
          cues: [
            'Seated; front leg 90° at hip and knee; back leg 90° at hip and knee',
            'Both shins parallel to the body line',
            'Pivot on the seat to switch the front / back leg — windshield-wiper motion',
            'Spine tall throughout; don’t round to "cheat" range',
            'Optional progression: lift the front knee off the floor at the top of the pivot',
          ],
          safetyNotes: [
            'No pinching in the front of the hip. If you feel it, you’re forcing range — back off.',
          ],
          variants: [
            { name: '90-90 hip lifts', note: 'Lift the back knee off the floor — harder.' },
            { name: 'Reverse 90-90', note: 'Pivot pointing the other direction; biases the other rotation.' },
          ],
          tags: ['healthspan', 'mobility', 'warm-up'],
        },
        {
          id: 'rec-dead-hang',
          name: 'Dead Hang',
          tier: 'S',
          intent: 'finisher',
          categories: ['healthspan', 'grip'],
          equipment: ['Pull-up bar'],
          primaryMuscles: ['Forearm flexors', 'Lats', 'Shoulder decompressors'],
          secondaryMuscles: ['Thoracic extensors'],
          cues: [
            'Pronated grip, shoulder-width',
            'Hang with active shoulders — lats engaged, ears NOT inside the arms',
            'Breathe normally; don’t hold the breath',
            'Target: 30s → 60s → 90s; once you hit 60s clean, add a weight vest',
          ],
          safetyNotes: [
            'If a shoulder pops or clicks painfully, get off the bar.',
            'Excellent for shoulder healthspan — counteracts decades of arms-down posture.',
          ],
          variants: [
            { name: 'L-sit hang', note: 'Knees up at 90°; brutal core demand.' },
            { name: 'Weighted hang', note: 'Vest or belt-loaded; trained as a max-effort lift.' },
            { name: 'One-arm hang', note: 'Advanced; grip and shoulder strength benchmark.' },
          ],
          tags: ['healthspan', 'grip'],
        },
        {
          id: 'rec-rice-bucket',
          name: 'Rice Bucket',
          tier: 'A',
          intent: 'corrective',
          categories: ['healthspan', 'grip'],
          equipment: ['5-gallon bucket', '20+ lb of dry rice (long grain)'],
          primaryMuscles: ['Forearm flexors', 'Forearm extensors', 'Hand intrinsics'],
          secondaryMuscles: ['Wrist stabilizers', 'Finger flexors'],
          cues: [
            'Bury hand and forearm in the rice up to the elbow',
            'Open and close the fist — grip and release through full ROM, slow',
            'Twist the wrist clockwise then counter — like opening a tight jar',
            'Spread the fingers wide against the resistance, return',
            'Pronate-supinate: rotate the forearm palm-up to palm-down repeatedly',
          ],
          safetyNotes: [
            'The neglected rehab tool — wrist tendinopathy, elbow tendinosis, post-injury rebuilding all benefit',
            'Resistance is omnidirectional — no joint takes a sudden load',
            'Daily-frequency friendly; 2–5 min per session is the dose',
          ],
          variants: [
            { name: 'Rice bucket fist holds', note: 'Make a fist deep in the rice, hold 10-20 sec.' },
            { name: 'Rice bucket finger walks', note: 'Walk fingertips across the rice surface — finger isolation.' },
            { name: 'Rice bucket scoops', note: 'Cup the rice and lift; mimics a heavy pinch grip.' },
          ],
          tags: ['healthspan', 'grip', 'corrective', 'rehab'],
        },
        {
          id: 'rec-finger-extension',
          name: 'Finger Extension (Rubber Band)',
          tier: 'A',
          intent: 'corrective',
          categories: ['healthspan', 'grip'],
          equipment: ['Small rubber band (orthodontic-style) OR hair tie'],
          primaryMuscles: ['Finger extensors', 'Hand intrinsics'],
          secondaryMuscles: ['Forearm extensors'],
          cues: [
            'Bundle all fingers and thumb together; loop the band around them',
            'Spread the fingers apart against the band',
            'Slow open, slow close — both directions matter',
            'Light tension; 15-25 reps per set',
            'The neglected counterpart to all the crushing grip work',
          ],
          safetyNotes: [
            'Most lifters train flexors heavily and extensors not at all — the imbalance drives elbow tendinopathy',
            'Daily-frequency friendly; this is rehab + maintenance',
            'Hair ties work just as well as fancy bands',
          ],
          variants: [
            { name: 'Single-finger extension', note: 'Band between thumb and one finger at a time; isolation.' },
            { name: 'Layered band extension', note: 'Two or three bands stacked for more resistance.' },
            { name: 'Rice bucket finger spread', note: 'Spread fingers wide deep in a rice bucket — omnidirectional.' },
          ],
          tags: ['healthspan', 'grip', 'corrective', 'prehab'],
        },
        {
          id: 'rec-heel-walk',
          name: 'Heel Walks',
          tier: 'B',
          intent: 'warmup',
          categories: ['healthspan', 'mobility'],
          equipment: ['Open floor'],
          primaryMuscles: ['Anterior tibialis'],
          secondaryMuscles: ['Foot intrinsics'],
          cues: [
            'Walk on heels; lift the toes hard',
            'Knees soft, not locked',
            'Pace is slow — quality over distance',
            'Stop the moment the shin cramps; recover, repeat',
          ],
          safetyNotes: [
            'Trivial-looking, hugely under-trained. The tibialis is the first line of defense against ankle and knee issues.',
          ],
          variants: [
            { name: 'Tibialis raises (seated)', note: 'Sitting; lift toes against a band.' },
            { name: 'Weighted tibialis raise', note: 'On a slant board; loaded.' },
          ],
          tags: ['healthspan', 'mobility', 'warm-up'],
        },
        {
          id: 'rec-zone-2-walk',
          name: 'Zone-2 Walk / Ruck',
          tier: 'S',
          intent: 'main',
          categories: ['healthspan', 'cardio'],
          equipment: ['Walking surface', 'Optional: weighted pack (5–15 kg)'],
          primaryMuscles: ['Mitochondrial density', 'Cardiac output (base)'],
          secondaryMuscles: ['Posterior chain (with pack)'],
          cues: [
            'Pace where you can hold a sentence-long conversation, but not sing',
            'Heart rate: ~60–70 % of max — top of zone 2',
            '45–60 minutes is the dose; 30 min minimum',
            'Nasal breathing only — if you have to mouth-breathe, slow down',
            'Frequency matters more than duration: 3–5×/week',
          ],
          safetyNotes: [
            'The most under-rated cardio modality. Builds the aerobic base that high-intensity work draws from.',
            'A weighted pack (rucking) doubles the metabolic cost without raising joint stress much.',
          ],
          variants: [
            { name: 'Treadmill incline walk', note: 'Same zone, indoors. 6–10 % incline at 5 km/h.' },
            { name: 'Zone-2 bike', note: 'Lower joint load; useful for high training volumes.' },
            { name: 'Rucking', note: '15–25 % bodyweight in a pack; raises calorie cost ~50 %.' },
          ],
          tags: ['healthspan', 'cardio', 'conditioning'],
        },
        {
          id: 'rec-30-30-intervals',
          name: '30/30 Intervals',
          tier: 'A',
          intent: 'finisher',
          categories: ['healthspan', 'cardio'],
          equipment: ['Bike, rower, or running surface'],
          primaryMuscles: ['Cardiac output', 'Type-II oxidative fibres'],
          secondaryMuscles: [],
          cues: [
            '30 seconds hard (~90 % effort) · 30 seconds easy',
            'Repeat 12–20 rounds; total work 6–10 minutes',
            'Lower joint impact than 4×4 — same V̇O₂ stimulus per minute',
            'If form breaks down, the round is over — quality > count',
          ],
          safetyNotes: [
            'Easier to dose than 4×4 for beginners — the work bouts are short enough that you can\'t fully accumulate fatigue.',
            'Cycle / row before running for these if you\'re new to interval work.',
          ],
          variants: [
            { name: '20/40s', note: '20s on, 40s off — more rest, useful early in a training block.' },
            { name: '40/20s', note: '40s on, 20s off — brutal; do once you have a base.' },
          ],
          tags: ['healthspan', 'cardio', 'conditioning'],
        },
        {
          id: 'rec-hip-cars',
          name: 'Hip CARs',
          tier: 'S',
          intent: 'warmup',
          categories: ['healthspan', 'mobility'],
          equipment: ['Mat or open floor'],
          primaryMuscles: ['Hip capsule', 'Glute medius', 'Hip rotators'],
          secondaryMuscles: ['Core (anti-extension)'],
          cues: [
            'On hands and knees (quadruped) or standing holding a rail',
            'Lift one knee out to the side (abduction) → rotate it back behind you (extension) → return',
            'Maximum slow circle — the goal is full ROM, not speed',
            'Brace the core hard; the other hip should NOT move',
            '5 reps each direction, each leg — 20 total reps takes 2–3 minutes',
          ],
          safetyNotes: [
            'CARs find capsular range that passive stretching misses.',
            'Slow is the point. If you can rush it, you\'re not at the joint\'s end-range.',
          ],
          variants: [
            { name: 'Standing hip CARs', note: 'Hold a rail; harder balance demand.' },
            { name: 'PAILs/RAILs', note: 'Add isometric contractions at end-range; advanced.' },
          ],
          tags: ['healthspan', 'mobility', 'warm-up'],
        },
        {
          id: 'rec-ankle-cars',
          name: 'Ankle CARs',
          tier: 'A',
          intent: 'warmup',
          categories: ['healthspan', 'mobility'],
          equipment: ['Mat or open floor', 'Optional: wall'],
          primaryMuscles: ['Ankle capsule', 'Tibialis anterior'],
          secondaryMuscles: ['Calf complex', 'Foot intrinsics'],
          cues: [
            'Seated, one leg crossed over the other — work the top ankle first',
            'Slow controlled circles through full ROM: dorsiflex → invert → plantarflex → evert',
            '5 circles each direction; the goal is the largest circle you can make',
            'Wall variant: half-kneeling, drive the front knee past the toe to load dorsiflexion',
            'Hold the deepest stretch 2–3 sec; never bounce',
          ],
          safetyNotes: [
            'Ankle ROM is the silent gatekeeper — limited dorsiflexion forces compensations up the chain (knee valgus, lumbar flexion in the squat).',
            'Slow is the point. If you can rush it, you\'re not at end-range.',
          ],
          variants: [
            { name: 'Banded ankle distraction', note: 'Loop a band around the front ankle, anchored low; lunge forward to traction the joint.' },
            { name: 'Knee-to-wall test', note: 'Diagnostic: front toe 4–5 in from wall; can the knee touch without the heel lifting?' },
            { name: 'Calf-stretch on slant board', note: 'Static loading of dorsiflexion ROM.' },
          ],
          tags: ['healthspan', 'mobility', 'warm-up'],
        },
        {
          id: 'rec-leg-swings',
          name: 'Leg Swings',
          tier: 'S',
          intent: 'warmup',
          categories: ['mobility'],
          equipment: ['Wall or rail for balance'],
          primaryMuscles: ['Hip flexors', 'Adductors', 'Hamstrings', 'Glutes'],
          secondaryMuscles: ['Hip capsule'],
          cues: [
            'Hold a wall or rail for balance, one hand',
            'Front-back: swing one leg forward and back through full ROM — 10 swings',
            'Side-side: swing the same leg across the body and out — 10 swings',
            'Switch legs; repeat both directions',
            'Build up the range gradually — first few swings small, then larger',
            'Keep the trunk tall; the leg moves, not the torso',
          ],
          safetyNotes: [
            'Dynamic, not ballistic — no end-range snap',
            'If a hip pinches at the top of the front swing, shorten the ROM',
          ],
          variants: [
            { name: 'Crossover leg swings', note: 'Front swing but cross over to the opposite side — bigger adductor ROM.' },
            { name: 'Slow tempo leg swings', note: 'Half speed; finds the deeper end-range without momentum.' },
          ],
          tags: ['mobility', 'warm-up'],
        },
        {
          id: 'rec-arm-circles',
          name: 'Arm Circles',
          tier: 'A',
          intent: 'warmup',
          categories: ['mobility'],
          equipment: ['Open floor'],
          primaryMuscles: ['Deltoids', 'Rotator cuff', 'Scapular stabilizers'],
          secondaryMuscles: ['Thoracic spine'],
          cues: [
            'Arms out to the sides at shoulder height',
            'Small forward circles — 10 reps, gradually growing larger',
            'Reverse: 10 large → small backward circles',
            'Smooth, controlled — this is wake-up work, not strength',
            'Total: ~40 reps, ~60 seconds',
          ],
          safetyNotes: [
            'Shoulder pain in any direction means stop and prioritize cuff prehab',
            'Trivial-looking; surprisingly effective at warming up the rotator cuff before pressing',
          ],
          variants: [
            { name: 'Single-arm circles', note: 'One side at a time; bigger ROM possible.' },
            { name: 'Wall-supported circles', note: 'Fingertips on a wall; isolates the scapula.' },
          ],
          tags: ['mobility', 'warm-up'],
        },
        {
          id: 'rec-cat-cow',
          name: 'Cat-Cow',
          tier: 'S',
          intent: 'warmup',
          categories: ['mobility', 'spine'],
          equipment: ['Mat'],
          primaryMuscles: ['Spinal erectors', 'Abdominals'],
          secondaryMuscles: ['Lats', 'Hip flexors'],
          cues: [
            'Hands and knees, hands under shoulders, knees under hips',
            'Inhale: drop the belly, lift the chest and tailbone — cow (extension)',
            'Exhale: round the spine, tuck the chin and tailbone — cat (flexion)',
            'Move with the breath, segmental — each vertebra in sequence',
            '8–10 slow cycles, ~1 minute',
          ],
          safetyNotes: [
            'Lumbar spondy lifters: keep the cow phase shallow; full extension can flare it.',
            'Quality over speed — the segmental movement is the point.',
          ],
          variants: [
            { name: 'Threaded cat-cow', note: 'Add a thread-the-needle on the rounded phase — adds t-spine rotation.' },
            { name: 'Cat-cow with diagonal reach', note: 'Reach an opposite arm + leg long at the top of the cow.' },
          ],
          tags: ['mobility', 'warm-up', 'spine-health'],
        },
        {
          id: 'rec-walkouts',
          name: 'Walkouts',
          tier: 'A',
          intent: 'warmup',
          categories: ['mobility'],
          equipment: ['Open floor'],
          primaryMuscles: ['Hamstrings', 'Shoulders', 'Core'],
          secondaryMuscles: ['Calves', 'Lats'],
          cues: [
            'Stand tall; hinge forward, walk the hands out to a high plank',
            'Hold the plank for 1 breath',
            'Walk the hands back to the feet; stand up',
            '6–8 reps, ~1 minute',
            'A whole-body warmup in one movement — hamstrings, shoulders, core',
          ],
          safetyNotes: [
            'No need to push for ROM if the hamstrings are tight — bend the knees as much as needed',
            'In the plank: hips don\'t sag, shoulders are over wrists',
          ],
          variants: [
            { name: 'Walkout with push-up', note: 'Add one push-up in the plank — primer for pressing work.' },
            { name: 'Walkout with shoulder taps', note: 'Tap each shoulder in the plank — adds anti-rotation.' },
          ],
          tags: ['mobility', 'warm-up'],
        },
        {
          id: 'rec-thoracic-rotation',
          name: 'Open-Book T-Spine Rotation',
          tier: 'A',
          intent: 'warmup',
          categories: ['healthspan', 'mobility'],
          equipment: ['Mat'],
          primaryMuscles: ['Thoracic spine rotators'],
          secondaryMuscles: ['Lats', 'Pecs'],
          cues: [
            'Side-lying, knees stacked at 90°, top hand on the floor in front',
            'Rotate the top arm up and over, opening the chest toward the ceiling — like opening a book',
            'Keep the knees pinned together — rotation comes from the t-spine, not the hips',
            'Exhale on the rotation; 2-count hold at end-range',
            '6–8 reps each side',
          ],
          safetyNotes: [
            'If you feel rotation in the low back, restack the knees and re-anchor.',
          ],
          variants: [
            { name: 'Quadruped t-spine rotation', note: 'On hands and knees; thread one arm under the body, then rotate up.' },
            { name: 'Open-book with reach', note: 'Reach the rotating arm long; bigger ROM.' },
          ],
          tags: ['healthspan', 'mobility', 'warm-up'],
        },
        {
          id: 'rec-kb-windmill',
          name: 'KB Windmill',
          tier: 'A',
          intent: 'main',
          categories: ['healthspan', 'mobility', 'imbalance'],
          equipment: ['Kettlebell (1)'],
          primaryMuscles: ['Obliques', 'Shoulder stabilizers', 'Hamstrings'],
          secondaryMuscles: ['Rotator cuff', 'T-spine mobility', 'Core'],
          cues: [
            'Start with the KB pressed overhead, arm locked, eyes on the bell',
            'Feet wider than shoulder-width; same-side foot turned out 45°',
            'Hinge sideways toward the opposite foot — KB tracks straight up the whole time',
            'Free hand slides down the opposite leg as a guide',
            'Reverse: hinge back to standing, arm still locked overhead',
          ],
          safetyNotes: [
            'A coordination + mobility lift before a strength one — start with the lightest KB you own',
            'EYES ON THE BELL throughout; the lockout has to be solid',
            'Skip if shoulder mobility is compromised — earn it through other work first',
          ],
          variants: [
            { name: 'Half-windmill (top half only)', note: 'Hinge halfway; the entry version.' },
            { name: 'Double-KB windmill', note: 'KB overhead AND KB in low hand — advanced.' },
            { name: 'Unweighted windmill', note: 'Pure mobility drill; same pattern, no load.' },
          ],
          tags: ['healthspan', 'mobility', 'rotator-cuff', 'corrective'],
        },
      ],
    },

    // ─── Facial & cervical ────────────────────────────────────────────────
    {
      key: 'facial-cervical',
      title: 'Facial & Cervical',
      blurb:
        'Neck training is one of the most under-trained healthspan investments. '
        + 'Jaw and tongue posture have a thinner evidence base but a low-cost, '
        + 'high-ceiling upside if executed cleanly.',
      exercises: [
        {
          id: 'rec-neck-flexion',
          name: 'Cervical Flexion (Light)',
          tier: 'A',
          intent: 'corrective',
          categories: ['facial'],
          equipment: ['Light plate (2.5–5 kg)', 'Bench or floor'],
          primaryMuscles: ['Deep neck flexors', 'Sternocleidomastoid'],
          secondaryMuscles: [],
          cues: [
            'Supine on the floor or with head off the end of a bench',
            'Place the plate (folded towel underneath) on the forehead',
            'Tuck the chin first, THEN lift the head — chin to chest, not chin to ceiling',
            '3-count hold at the top',
            'Lower under control — no sudden drop',
          ],
          safetyNotes: [
            'Start with 2.5 kg. The neck is small; load progression is in 0.5–1 kg jumps.',
            'Stop at any sharp pain or pinch in the throat or skull base.',
            'Skip this if you have a history of cervical disc issues — talk to a clinician first.',
          ],
          variants: [
            { name: 'No-load chin tuck + lift', note: 'Pure bodyweight; the right starting point for most.' },
            { name: 'Neck harness flexion', note: 'Use a neck-training harness; smoother resistance curve.' },
          ],
          tags: ['facial', 'corrective', 'healthspan'],
        },
        {
          id: 'rec-neck-extension',
          name: 'Cervical Extension (Light)',
          tier: 'A',
          intent: 'corrective',
          categories: ['facial'],
          equipment: ['Light plate (2.5–5 kg)', 'Bench'],
          primaryMuscles: ['Cervical extensors', 'Upper trapezius (deep)'],
          secondaryMuscles: [],
          cues: [
            'Lie face-down with head off the end of a bench',
            'Plate on the back of the head; folded towel for comfort',
            'Lower the chin toward the chest; lift back to neutral (not past)',
            '3-count hold at neutral',
            'Move slow; the joint is small and the ROM is shorter than you think',
          ],
          safetyNotes: [
            'Same load progression as flexion: 0.5–1 kg jumps.',
            'Never go past neutral into hyperextension — that’s how necks get tweaked.',
          ],
          variants: [
            { name: 'No-load extension', note: 'Bodyweight; default starting point.' },
            { name: 'Neck harness extension', note: 'Plate hangs from a chain off a harness.' },
          ],
          tags: ['facial', 'corrective', 'healthspan'],
        },
        {
          id: 'rec-mewing',
          name: 'Tongue Posture (Mewing-Adjacent)',
          tier: 'C',
          intent: 'corrective',
          categories: ['facial'],
          equipment: ['None'],
          primaryMuscles: ['Tongue', 'Pterygoids', 'Hyoid musculature'],
          secondaryMuscles: [],
          cues: [
            'Whole tongue against the roof of the mouth — not just the tip',
            'Teeth lightly together, lips closed',
            'Breathe through the nose, always',
            'Posture cue, not a workout — practice it while reading, walking, working',
            'Evidence base is thin compared to the rest of this catalog. Treat as low-cost experiment.',
          ],
          safetyNotes: [
            'No harm, no cost. Do not expect the physiognomic claims found online — the muscular and breathing benefit is real, the bone-restructuring claims are not.',
          ],
          variants: [
            { name: 'Nasal breathing', note: 'The 80 % version: just breathe through your nose, always. Bigger ROI than anything else here.' },
            { name: 'Falim gum / mastic', note: 'Hard gum for masseter and pterygoid load.' },
          ],
          tags: ['facial', 'corrective', 'healthspan'],
        },
      ],
    },

    // ─── Stretching ───────────────────────────────────────────────────────
    // Held positions (not active mobility — that lives in the existing
    // mobility tag). Time-based prescriptions consumed by the duration
    // log surface. Per-side notes flow through parsePrescription.perSide.
    {
      key: 'stretching',
      title: 'Stretching',
      blurb:
        'Static holds for tissue length. Best in the evening or '
        + 'post-training when muscles are warm. Breath stays nasal '
        + 'and slow throughout.',
      exercises: [
        {
          id: 'rec-pigeon-stretch',
          name: 'Pigeon Stretch',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Floor', 'Optional: yoga block'],
          primaryMuscles: ['Glute medius', 'Piriformis', 'TFL'],
          secondaryMuscles: ['Hip capsule'],
          cues: [
            'Front shin angled across the body; back leg long behind you',
            'Square the hips toward the floor — both hip points level',
            'Walk the hands forward, lower the chest over the front shin',
            'Sink into the front-hip glute — that\'s the target',
            'Breathe long and slow; let the tissue release at exhale',
          ],
          safetyNotes: [
            'Knee pain in the front leg → narrow the shin angle. Hip pain is fine; sharp knee pain is not.',
            'A block under the front-leg hip takes the load off the joint if you can\'t get square.',
          ],
          variants: [
            { name: 'Supported pigeon', note: 'Forehead on a block; reduces depth, keeps the spine long.' },
            { name: 'Supine figure-4', note: 'On your back; same target, gentler on the front knee.' },
          ],
          tags: ['mobility', 'corrective', 'flexibility'],
        },
        {
          id: 'rec-frog-stretch',
          name: 'Frog Stretch',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Floor', 'Padding for knees'],
          primaryMuscles: ['Adductors', 'Groin'],
          secondaryMuscles: ['Hip capsule'],
          cues: [
            'On all fours, knees wide, shins parallel, feet flexed',
            'Hips stack over knees — not behind them',
            'Rock slowly back and forth; don\'t sink and hold to start',
            'After 5–6 rocks, settle into the deepest position',
            'Diaphragmatic breath — belly drops between the thighs',
          ],
          safetyNotes: [
            'Pad the knees. This stretch is intense; do not bounce.',
            'Inner-thigh sensation is the target. Sharp knee or groin pain → back out.',
          ],
          variants: [
            { name: 'Half frog', note: 'One leg only; less intense per side, easier to control.' },
            { name: 'Frog with hip rocks', note: 'Mobility-bias variant: rock without holding.' },
          ],
          tags: ['mobility', 'flexibility'],
        },
        {
          id: 'rec-couch-stretch',
          name: 'Couch Stretch',
          tier: 'S',
          intent: 'corrective',
          categories: ['mobility', 'posture'],
          equipment: ['Wall or couch', 'Padding for the down knee'],
          primaryMuscles: ['Hip flexors', 'Quadriceps (rectus femoris)'],
          secondaryMuscles: ['TFL'],
          cues: [
            'Back knee on padding, shin running up the wall',
            'Front foot flat on the floor, knee over ankle',
            'Squeeze the back-leg glute hard — that\'s the cue that does the work',
            'Tuck the tailbone; the lower-back must not arch',
            'Once braced, walk the torso upright — feel the front of the hip lengthen',
          ],
          safetyNotes: [
            'Pad the knee well; the position is unforgiving on the patella.',
            'If the lower back is doing the stretching, the glute isn\'t firing. Re-set.',
          ],
          variants: [
            { name: 'Half-kneel hip flexor', note: 'No wall; easier entry, less depth.' },
            { name: 'Couch stretch with reach', note: 'Same-side arm overhead; layered T-spine extension.' },
          ],
          tags: ['mobility', 'posture', 'flexibility'],
        },
        {
          id: 'rec-90-90-hold',
          name: '90-90 Hip Hold',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Floor'],
          primaryMuscles: ['Hip rotators', 'Glute medius'],
          secondaryMuscles: ['Hip capsule'],
          cues: [
            'Front leg 90°, back leg 90° — both shins flat on the floor',
            'Sit upright; both sit bones grounded if possible',
            'Lean forward over the front shin slowly',
            'Hold; then sit back up and pulse for 5 reps',
            'Switch sides — your "tight" side will surprise you',
          ],
          safetyNotes: [
            'Knee discomfort → reduce the angle to 70–80° rather than forcing 90°.',
          ],
          variants: [
            { name: 'Seated 90-90 transition', note: 'Active variant: sweep between sides without using hands.' },
            { name: 'Elevated 90-90', note: 'Sit on a cushion if you can\'t ground both sit bones.' },
          ],
          tags: ['mobility', 'flexibility'],
        },
        {
          id: 'rec-supine-hamstring',
          name: 'Supine Hamstring Stretch',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Floor', 'Strap or towel'],
          primaryMuscles: ['Hamstrings'],
          secondaryMuscles: ['Calves', 'Posterior chain'],
          cues: [
            'Lie on your back, one leg flat',
            'Loop a strap around the ball of the lifting foot',
            'Straight leg lifts toward the ceiling; both hips stay on the floor',
            'Pull gently — the stretch should be a long line down the back of the leg',
            'Hold; do not bounce',
          ],
          safetyNotes: [
            'If the hamstring cramps, lower the leg — you\'ve gone past the stretch into a contraction.',
            'Sciatic-type tingling → back out immediately. This is not a nerve stretch.',
          ],
          variants: [
            { name: 'Doorway hamstring stretch', note: 'Heel on a doorframe; no strap needed.' },
            { name: 'Banded hamstring stretch', note: 'A band gives a gentle assistive pull.' },
          ],
          tags: ['mobility', 'flexibility'],
        },
        {
          id: 'rec-doorway-pec',
          name: 'Doorway Pec Stretch',
          tier: 'S',
          intent: 'corrective',
          categories: ['posture', 'mobility'],
          equipment: ['Doorway'],
          primaryMuscles: ['Pectoralis major', 'Pec minor'],
          secondaryMuscles: ['Anterior deltoid'],
          cues: [
            'Forearm on the doorframe, elbow at shoulder height',
            'Step the same-side foot through the doorway',
            'Rotate the torso away from the arm — feel the chest open',
            'Three heights: elbow low, mid, high — each biases a different fiber',
            'Hold each height; sink with breath',
          ],
          safetyNotes: [
            'Shoulder pinch or impingement → lower the elbow height.',
            'If you have a labrum issue, skip this and use a foam roller across the T-spine instead.',
          ],
          variants: [
            { name: 'Single-arm wall pec', note: 'Wall corner; same intent, less torque.' },
            { name: 'Lying pec stretch over foam roller', note: 'Foam roller along the spine, arms hang wide.' },
          ],
          tags: ['posture', 'mobility', 'flexibility'],
        },
        {
          id: 'rec-childs-pose',
          name: 'Child\'s Pose',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility', 'spine'],
          equipment: ['Floor', 'Optional: bolster'],
          primaryMuscles: ['Lats', 'Spinal erectors'],
          secondaryMuscles: ['Glutes', 'Hips'],
          cues: [
            'Big toes touching, knees wide',
            'Sit back onto the heels; chest lowers between the thighs',
            'Arms extend forward, palms down, fingers spread',
            'Drop the forehead to the floor or a block',
            'Slow nasal breaths into the back of the ribcage',
          ],
          safetyNotes: [
            'Knee issues → narrow the knees, or place a bolster between the calves and hamstrings.',
          ],
          variants: [
            { name: 'Side-bend child\'s pose', note: 'Walk the hands to one side; bigger lat stretch.' },
            { name: 'Supported child\'s pose', note: 'Bolster under the torso; restorative variant.' },
          ],
          tags: ['mobility', 'spine', 'flexibility'],
        },
        {
          id: 'rec-sun-salutation-flow',
          name: 'Forward Fold → Down Dog Flow',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Floor'],
          primaryMuscles: ['Posterior chain'],
          secondaryMuscles: ['Shoulders', 'Calves'],
          cues: [
            'Stand tall, hinge into a forward fold — hang heavy',
            'Walk the hands forward to plank',
            'Push hips back and up into downward dog; press heels toward the floor',
            'Walk hands back to feet, roll up to standing',
            'One flow = one round. Move with breath, not speed',
          ],
          safetyNotes: [
            'Wrists tender → stagger the hands or skip plank for a knees-down variant.',
          ],
          variants: [
            { name: 'Add cobra/upward dog', note: 'Lower through plank, press into cobra before pushing back to down dog.' },
            { name: 'Add a lunge step', note: 'Step one foot forward from down dog into a low lunge; alternate sides.' },
          ],
          tags: ['mobility', 'flexibility'],
        },
      ],
    },

    // ─── Posture Practice ─────────────────────────────────────────────────
    // Standalone postural drills (not corrective lifts). Repeatable cues
    // the user can do anywhere — at a desk, in line, between sets.
    {
      key: 'posture-practice',
      title: 'Posture Practice',
      blurb:
        'Static drills that recalibrate where "neutral" sits. '
        + 'Two minutes daily beats a single long session.',
      exercises: [
        {
          id: 'rec-wall-posture-check',
          name: 'Wall Posture Check',
          tier: 'S',
          intent: 'corrective',
          categories: ['posture'],
          equipment: ['Wall'],
          primaryMuscles: ['Deep cervical flexors', 'Spinal erectors'],
          secondaryMuscles: ['Glutes'],
          cues: [
            'Heels, butt, upper back, and back of head all touch the wall',
            'Hand-width gap at the lumbar — natural curve, no more',
            'Pull the chin back (not down) — back of the neck against the wall',
            'Soft knees; don\'t lock out and tilt the pelvis',
            'Step away from the wall, keeping every contact point\'s feeling',
          ],
          safetyNotes: [
            'Head doesn\'t touch the wall easily → you have forward-head posture. Don\'t force it; build up.',
          ],
          variants: [
            { name: 'Wall angels', note: 'Add slow Y-T-W against the wall; same setup, active drill.' },
            { name: 'Doorway check', note: 'Same drill in a doorway; useful when no flat wall is around.' },
          ],
          tags: ['posture', 'corrective'],
        },
        {
          id: 'rec-ribs-down',
          name: 'Ribs-Down Drill',
          tier: 'S',
          intent: 'corrective',
          categories: ['posture'],
          equipment: ['None'],
          primaryMuscles: ['Diaphragm', 'Deep core', 'Obliques'],
          secondaryMuscles: ['Spinal erectors'],
          cues: [
            'Stand tall; place one hand on the sternum, one on the lower belly',
            'Notice if the bottom ribs flare forward — most people\'s default',
            'Exhale fully and let the ribs sink down toward the pelvis',
            'Keep the breath in the belly — no chest rise',
            'This is your bracing default; use it before every lift and at random through the day',
          ],
          safetyNotes: [
            'This is a position drill, not a strength exercise. No load.',
          ],
          variants: [
            { name: 'Supine ribs-down', note: 'On your back with knees bent — easier to feel.' },
            { name: '90-90 ribs-down', note: 'Feet on a wall, hips and knees at 90°; classic DNS / PRI position.' },
          ],
          tags: ['posture', 'corrective'],
        },
        {
          id: 'rec-desk-reset',
          name: 'Desk Reset Sequence',
          tier: 'A',
          intent: 'corrective',
          categories: ['posture'],
          equipment: ['Chair', 'Desk'],
          primaryMuscles: ['Cervical spine', 'Shoulders', 'Hip flexors'],
          secondaryMuscles: [],
          cues: [
            'Stand up. Hands on hips, gentle backbend — 5 breaths',
            'Chin tucks against the air — 10 reps',
            'Roll the shoulders back × 5, then forward × 5',
            'Step into a doorway pec stretch — 30 sec each side',
            'Sit back down. Reset the wall-posture cue mentally',
          ],
          safetyNotes: [
            'Move slowly through the backbend — most desk-stiff spines aren\'t ready for full extension.',
          ],
          variants: [
            { name: 'Walking reset', note: 'Walk for 3 minutes between cues — bigger return.' },
            { name: 'Standing desk transition', note: 'Use as the cue to switch from sit to stand and vice versa.' },
          ],
          tags: ['posture', 'corrective', 'healthspan'],
        },
      ],
    },

    // ─── Balance / Proprioception ─────────────────────────────────────────
    // Single-leg and vestibular drills. Calibrates the joint sensors that
    // strength training alone doesn't reach. Big returns over time, very
    // low cost per session.
    {
      key: 'balance',
      title: 'Balance & Proprioception',
      blurb:
        'The most under-trained athletic quality. Two minutes a day '
        + 'compounds into measurable joint stability within a month.',
      exercises: [
        {
          id: 'rec-single-leg-stand',
          name: 'Single-Leg Stand',
          tier: 'S',
          intent: 'corrective',
          categories: ['imbalance'],
          equipment: ['Floor'],
          primaryMuscles: ['Foot intrinsics', 'Glute medius', 'Ankle stabilisers'],
          secondaryMuscles: ['Core'],
          cues: [
            'Bare feet if possible — feedback through the toes',
            'Stand on one leg, knee soft, foot tripod (big toe, little toe, heel)',
            'Spread the toes — grip the floor without curling them',
            'Eyes open first; once 60 sec feels easy, close them',
            'Switch sides — the harder side is the priority',
          ],
          safetyNotes: [
            'Near a wall the first few times — eyes closed is a different sport.',
            'Numbness in the foot → you\'re gripping with the toes instead of spreading.',
          ],
          variants: [
            { name: 'Eyes closed', note: 'Removes visual reference; vestibular and proprioceptive only.' },
            { name: 'Head turns', note: 'Slow head turns while standing — adds vestibular demand.' },
            { name: 'Foam pad stand', note: 'Unstable surface; advanced.' },
          ],
          tags: ['imbalance', 'corrective', 'healthspan'],
        },
        {
          id: 'rec-tandem-walk',
          name: 'Tandem Walk',
          tier: 'A',
          intent: 'corrective',
          categories: ['imbalance'],
          equipment: ['Hallway or straight line'],
          primaryMuscles: ['Ankle stabilisers', 'Hip stabilisers'],
          secondaryMuscles: ['Core'],
          cues: [
            'Heel-to-toe along an imaginary line — one foot directly in front of the other',
            'Arms out for balance; soft knees',
            'Go slow — slow is the difficulty knob',
            'Walk forward 20 steps; turn carefully; walk back',
            'Once forward is solid, try walking it backward',
          ],
          safetyNotes: [
            'Near a wall the first few times.',
            'A line of tape on the floor helps with the visual reference.',
          ],
          variants: [
            { name: 'Tandem walk eyes closed', note: 'Advanced. Vestibular system carries the load.' },
            { name: 'Backward tandem walk', note: 'Easier on balance but harder on proprioception.' },
          ],
          tags: ['imbalance', 'corrective', 'healthspan'],
        },
        {
          id: 'rec-vestibular-gaze',
          name: 'Vestibular Gaze Stabilisation',
          tier: 'B',
          intent: 'corrective',
          categories: ['imbalance'],
          equipment: ['None'],
          primaryMuscles: ['Vestibular system', 'Cervical stabilisers'],
          secondaryMuscles: [],
          cues: [
            'Fix gaze on a point at arm\'s length',
            'Slowly rotate the head left and right while keeping eyes locked on the point',
            'Then nod yes / no while staying locked on the point',
            'Slow is the difficulty — fast hides the deficit',
            '30 seconds each direction is enough to start',
          ],
          safetyNotes: [
            'Dizziness or nausea → stop, sit down, eyes on the horizon.',
            'Recent concussion → talk to a clinician before doing this.',
          ],
          variants: [
            { name: 'VOR x1', note: 'Head moves, target stays still — gaze locked on target.' },
            { name: 'VOR x2', note: 'Head and target move in opposite directions; advanced.' },
          ],
          tags: ['imbalance', 'corrective', 'healthspan'],
        },
        {
          id: 'rec-rocking-balance',
          name: 'Rocking Balance Drill',
          tier: 'B',
          intent: 'corrective',
          categories: ['imbalance'],
          equipment: ['Floor', 'Optional: balance pad'],
          primaryMuscles: ['Foot intrinsics', 'Ankle stabilisers', 'Core'],
          secondaryMuscles: [],
          cues: [
            'Stand on both feet; shift weight to the balls of the feet, then heels',
            'Then lateral — shift to outer edges, then inner edges',
            'Then on one leg: same four directions, smaller amplitude',
            'Goal is conscious control, not max range',
            'Two slow minutes is plenty',
          ],
          safetyNotes: [
            'Near a wall or counter; the first time you try this single-leg you\'ll wobble.',
          ],
          variants: [
            { name: 'Balance pad rocker', note: 'Foam pad under the foot — much harder.' },
            { name: 'Eyes closed rocker', note: 'Remove visual feedback; vestibular only.' },
          ],
          tags: ['imbalance', 'corrective'],
        },
      ],
    },

    // ─── Soft Tissue / Recovery ───────────────────────────────────────────
    // Foam roller and lacrosse ball protocols. The "what to do" of recovery
    // — held side-tribe of stretching but different mechanism (myofascial,
    // not lengthening).
    {
      key: 'soft-tissue',
      title: 'Soft Tissue',
      blurb:
        'Self-myofascial work. Find the tender spots, breathe, wait. '
        + 'A foam roller and a lacrosse ball get you 90% of the way.',
      exercises: [
        {
          id: 'rec-foam-roll-tspine',
          name: 'T-Spine Foam Roll',
          tier: 'S',
          intent: 'corrective',
          categories: ['mobility', 'posture'],
          equipment: ['Foam roller'],
          primaryMuscles: ['Thoracic spine', 'Mid/lower trapezius'],
          secondaryMuscles: ['Lats'],
          cues: [
            'Roller across the upper back, perpendicular to the spine',
            'Hands behind the head — support the cervical spine',
            'Slow roll from mid-back to upper traps',
            'Stop on tender spots; arch over the roller for 3 slow breaths',
            'Then extend backward over the roller at one fixed level',
          ],
          safetyNotes: [
            'Never roll the lumbar spine on a foam roller.',
            'Sharp pain ≠ "good tightness" — back out.',
          ],
          variants: [
            { name: 'Peanut roller', note: 'Two lacrosse balls taped together; bypasses the spinous processes.' },
            { name: 'Doorway T-spine extension', note: 'No roller; arms overhead, lean back — gentler.' },
          ],
          tags: ['mobility', 'posture', 'corrective'],
        },
        {
          id: 'rec-foam-roll-quads',
          name: 'Quad Foam Roll',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Foam roller'],
          primaryMuscles: ['Quadriceps', 'Hip flexors'],
          secondaryMuscles: [],
          cues: [
            'Plank position over the roller; roller across the front of the thighs',
            'Forearms support most of the load — don\'t crush yourself',
            'Slow roll from mid-thigh to top of hip',
            'Stop on tender spots and bend the knee in / out for 5 reps',
            'Then switch and target the other thigh, or one leg at a time',
          ],
          safetyNotes: [
            'Avoid rolling directly over the kneecap or hip bone.',
            'Bruising → reduce pressure with more forearm load.',
          ],
          variants: [
            { name: 'Single-leg quad roll', note: 'Stack the off-leg over the on-leg; doubles the pressure.' },
            { name: 'Trigger ball quad', note: 'Lacrosse ball into a specific tender spot; precise.' },
          ],
          tags: ['mobility', 'corrective'],
        },
        {
          id: 'rec-lacrosse-glute',
          name: 'Lacrosse Ball Glute / Piriformis',
          tier: 'S',
          intent: 'corrective',
          categories: ['mobility'],
          equipment: ['Lacrosse ball or trigger ball'],
          primaryMuscles: ['Glute max', 'Glute med', 'Piriformis'],
          secondaryMuscles: ['Deep hip rotators'],
          cues: [
            'Sit on the floor, ball under one glute, hand support behind you',
            'Cross the same-side ankle over the opposite knee',
            'Find the tender spot; hold static, breathe long for 30–45 sec',
            'Then make small circles, then knee drops in / out × 5',
            'Move to the next zone; cover the whole glute over 2–3 minutes',
          ],
          safetyNotes: [
            'Sharp pain or shooting nerve sensation → move the ball away from the spot.',
            'After 90 sec on one spot, move on — diminishing returns.',
          ],
          variants: [
            { name: 'Wall lacrosse glute', note: 'Standing against a wall; lighter pressure, easier control.' },
            { name: 'Peanut on the SI joint', note: 'Two balls; works both sides of the sacrum at once.' },
          ],
          tags: ['mobility', 'corrective', 'healthspan'],
        },
        {
          id: 'rec-foam-roll-lats',
          name: 'Lat Foam Roll',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility', 'posture'],
          equipment: ['Foam roller'],
          primaryMuscles: ['Latissimus dorsi'],
          secondaryMuscles: ['Teres major'],
          cues: [
            'Lie on your side, roller in the armpit, arm overhead',
            'Slow roll from armpit down toward the lower ribs',
            'Stop on tender spots; rotate the torso forward / back to find the fiber',
            'Holds with breath beat fast rolling',
            'Switch sides',
          ],
          safetyNotes: [
            'Stay off the ribcage itself — work only in the muscle belly.',
          ],
          variants: [
            { name: 'Lacrosse ball against wall', note: 'Standing — lighter, more precise.' },
            { name: 'Lat stretch in down-dog', note: 'No tools; reach one hand farther, sink the same-side shoulder.' },
          ],
          tags: ['mobility', 'posture', 'corrective'],
        },
        {
          id: 'rec-lacrosse-plantar',
          name: 'Plantar Fascia Ball Roll',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility', 'healthspan'],
          equipment: ['Lacrosse ball or tennis ball'],
          primaryMuscles: ['Plantar fascia', 'Foot intrinsics'],
          secondaryMuscles: ['Calves'],
          cues: [
            'Standing, roll the ball under one foot, ball-of-foot to heel',
            'Most of your weight stays on the supporting leg — graduated pressure',
            'Spend extra time on the arch and the heel pad',
            'Switch feet; ~60 sec per side is plenty',
            'Stand up afterward — the calf feel changes too',
          ],
          safetyNotes: [
            'Acute plantar fasciitis → start with a frozen water bottle (cold + soft) instead.',
          ],
          variants: [
            { name: 'Frozen water bottle', note: 'Cold + pressure; gentler entry point.' },
            { name: 'Lacrosse ball seated', note: 'Sit on a chair; zero bodyweight load.' },
          ],
          tags: ['mobility', 'healthspan'],
        },
      ],
    },

    // ─── Mind-Body Flows ──────────────────────────────────────────────────
    // Choreographed multi-movement sequences. Lower intensity, higher
    // attention demand. Treats body as a system: breath + movement +
    // gaze + balance all at once.
    {
      key: 'mind-body',
      title: 'Mind-Body Flows',
      blurb:
        'Sequenced movement. Breath leads, body follows. '
        + 'These compound across years in ways isolated drills do not.',
      exercises: [
        {
          id: 'rec-sun-salutation-a',
          name: 'Sun Salutation A',
          tier: 'A',
          intent: 'main',
          categories: ['mobility'],
          equipment: ['Floor'],
          primaryMuscles: ['Full body'],
          secondaryMuscles: [],
          cues: [
            'Mountain — stand tall, hands at heart center',
            'Inhale arms overhead, exhale fold forward',
            'Inhale half-lift (long spine), exhale step or jump back to plank',
            'Lower through chaturanga, inhale upward dog, exhale downward dog (5 breaths)',
            'Inhale step / jump forward, exhale fold, inhale rise to mountain',
          ],
          safetyNotes: [
            'Wrists tender → drop knees in chaturanga, or skip up-dog for cobra.',
            'Move with breath. Speeding up loses the practice.',
          ],
          variants: [
            { name: 'Knees-down Sun A', note: 'Modify chaturanga and up-dog on the knees; the same shapes.' },
            { name: 'Sun Salutation B', note: 'Adds chair pose and warrior; longer flow, more leg load.' },
          ],
          tags: ['mobility', 'flexibility', 'healthspan'],
        },
        {
          id: 'rec-qigong-eight-brocades',
          name: 'Eight Brocades (Ba Duan Jin)',
          tier: 'A',
          intent: 'corrective',
          categories: ['mobility', 'healthspan'],
          equipment: ['Floor'],
          primaryMuscles: ['Full body'],
          secondaryMuscles: [],
          cues: [
            'Eight slow standing movements; classical Chinese health qigong',
            'Each move repeats 6–12 times; whole sequence is ~10 min',
            'Breath leads movement — slow nasal in / slow nasal out',
            'Feel the joints open with each cycle; never force range',
            'Find a video reference once, then practise alone',
          ],
          safetyNotes: [
            'No safety concerns at standard pace. If a movement aggravates a joint, omit it.',
          ],
          variants: [
            { name: 'Seated brocades', note: 'Each movement done seated; accessible for older adults.' },
            { name: 'Single brocade focus', note: 'Pick one movement and do it 5 minutes; deeper effect.' },
          ],
          tags: ['mobility', 'healthspan', 'flexibility'],
        },
        {
          id: 'rec-tai-chi-opening',
          name: 'Tai Chi Opening Form',
          tier: 'A',
          intent: 'corrective',
          categories: ['imbalance', 'mobility'],
          equipment: ['Floor'],
          primaryMuscles: ['Full body'],
          secondaryMuscles: [],
          cues: [
            'Stand quietly, feet shoulder-width, knees soft, arms hanging',
            'Slowly raise both arms forward to shoulder height',
            'Lower the arms while bending the knees — feel the weight settle',
            'Shift weight side to side, never fully lifting the foot',
            'Repeat the sequence; the practice is the slowness',
          ],
          safetyNotes: [
            'Knee discomfort → don\'t go as deep. Standing height is fine.',
          ],
          variants: [
            { name: 'Cloud hands', note: 'Single move; hands trace circles, weight shifts. Five minutes is a full session.' },
            { name: 'Full Yang short form', note: '13 or 24 postures; learn from a video over weeks.' },
          ],
          tags: ['mobility', 'imbalance', 'healthspan'],
        },
      ],
    },
  ],
};

export default recovery;
