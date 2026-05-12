import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dayList, principles, injuryPrevention } from '../data';
import { DayTab } from '../components/DayTab';
import { PrinciplesBar } from '../components/PrinciplesBar';
import { color, motion as M, accentFor } from '../design-system';
import { useHaptics } from '../hooks/useHaptics';

export function Home() {
  const navigate = useNavigate();
  const haptic = useHaptics();

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '24px 16px 120px',
      }}
    >
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={M.smooth}
        style={{ marginBottom: 28 }}
      >
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.32em',
          color: color.muted,
          textTransform: 'uppercase',
        }}>
          A · P · E · X
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(56px, 14vw, 96px)',
          lineHeight: 0.92,
          margin: '6px 0 0',
          color: color.text,
          letterSpacing: '-0.005em',
        }}>
          FULL<br />SPECTRUM<br />TRAINING.
        </h1>
        <p style={{
          marginTop: 16,
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: color.muted,
          maxWidth: 460,
          lineHeight: 1.55,
        }}>
          A reference for Push, Pull, Legs, and Core training. Every exercise,
          tier-ranked. Every cue, every variant. Built for the gym floor.
        </p>
      </motion.header>

      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: M.reveal },
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
          marginBottom: 36,
        }}
      >
        {dayList.map((d) => (
          <motion.div
            key={d.key}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show:   { opacity: 1, y: 0 },
            }}
            transition={M.smooth}
          >
            <DayTab
              dayKey={d.key}
              name={d.name}
              subtitle={d.subtitle}
              accent={accentFor(d.key)}
              onClick={() => {
                haptic('select');
                navigate(`/${d.key}`);
              }}
            />
          </motion.div>
        ))}
      </motion.section>

      <PrinciplesBar
        principles={principles}
        injuryPrevention={injuryPrevention}
        accent={color.text}
      />
    </main>
  );
}
