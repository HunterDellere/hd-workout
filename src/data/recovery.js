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
          categories: ['posture'],
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
          categories: ['posture'],
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
        {
          id: 'rec-suitcase-carry',
          name: 'Suitcase Carry',
          tier: 'S',
          intent: 'main',
          categories: ['imbalance', 'spine'],
          equipment: ['Dumbbell or kettlebell'],
          primaryMuscles: ['Obliques', 'Quadratus lumborum'],
          secondaryMuscles: ['Grip', 'Shoulder stabilizers', 'Glute medius'],
          cues: [
            'One weight, one hand. Walk',
            'Shoulders level — don’t lean or hike',
            'Ribs stacked over pelvis; no side-bend',
            'Eyes forward; relaxed neck',
            'Match duration on the weaker side first, then the strong side',
          ],
          safetyNotes: [
            'Pick a weight you can carry cleanly. Asymmetric loading is the whole point — don’t cheat with body lean.',
          ],
          variants: [
            { name: 'Farmer carry', note: 'Both hands loaded; less anti-lateral demand.' },
            { name: 'Overhead carry', note: 'One arm overhead; thoracic + shoulder stability.' },
          ],
          tags: ['imbalance', 'anti-lateral-flexion', 'core-anti', 'grip'],
        },
        {
          id: 'rec-copenhagen',
          name: 'Copenhagen Plank',
          tier: 'A',
          intent: 'corrective',
          categories: ['imbalance'],
          equipment: ['Flat bench'],
          primaryMuscles: ['Adductors', 'Obliques'],
          secondaryMuscles: ['Glute medius'],
          cues: [
            'Side plank position; top leg’s inner thigh on the bench',
            'Bottom leg straight, tucked underneath',
            'Squeeze the inner thigh into the bench to lift the bottom hip',
            'Body in a straight line — no sag, no pike',
            'Start at the knee on the bench (regression); progress to ankle',
          ],
          safetyNotes: [
            'Notorious for adductor strains if you load too aggressively. Start with the knee, not the ankle.',
            'Stop if you feel a sharp pull in the groin.',
          ],
          variants: [
            { name: 'Knee Copenhagen', note: 'Top knee on the bench; ~50 % the demand of full version.' },
            { name: 'Hip-lift Copenhagen', note: 'Lower and lift the bottom hip each rep.' },
          ],
          tags: ['imbalance', 'corrective', 'anti-lateral-flexion'],
        },
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
        {
          id: 'rec-dead-bug',
          name: 'Dead Bug',
          tier: 'A',
          intent: 'activation',
          categories: ['spine'],
          equipment: ['Mat'],
          primaryMuscles: ['Rectus abdominis', 'Transverse abdominis'],
          secondaryMuscles: ['Hip flexors'],
          cues: [
            'Supine; arms vertical, knees and hips at 90°',
            'Press the lower back into the floor — that contact never breaks',
            'Lower opposite arm and leg slowly; return',
            'Exhale on the lowering phase to amplify the brace',
            'If the lower back lifts, shorten the ROM',
          ],
          safetyNotes: [
            'The non-negotiable: lower back stays glued to the floor. If it lifts, the rep didn’t count.',
          ],
          variants: [
            { name: 'Loaded dead bug', note: 'Light plate in each hand; harder anti-extension.' },
            { name: 'Heel-tap dead bug', note: 'Tap heel to floor instead of full extension; regression.' },
          ],
          tags: ['corrective', 'spine-health', 'anti-extension', 'core-anti', 'activation'],
        },
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
          categories: ['healthspan'],
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
          categories: ['healthspan'],
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
          id: 'rec-heel-walk',
          name: 'Heel Walks',
          tier: 'B',
          intent: 'warmup',
          categories: ['healthspan'],
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
  ],
};

export default recovery;
