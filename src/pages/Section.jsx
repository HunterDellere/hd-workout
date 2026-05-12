import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSection, getDay } from '../data';
import { color, accentFor, motion as M, Icon, Badge } from '../design-system';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { useHaptics } from '../hooks/useHaptics';

export function Section() {
  const { dayKey, sectionKey } = useParams();
  const navigate = useNavigate();
  const haptic = useHaptics();
  const section = getSection(dayKey, sectionKey);
  const day = getDay(dayKey);
  const [open, setOpen] = useState(null);

  if (!section || !day) {
    return (
      <main style={{ padding: 24, color: color.text, maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-body)' }}>Unknown section.</p>
        <button onClick={() => navigate(`/${dayKey || ''}`)}>Back</button>
      </main>
    );
  }
  const accent = accentFor(day.key);

  return (
    <main style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '20px 16px 120px',
      color: color.text,
    }}>
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={M.smooth}
        style={{ marginBottom: 18 }}
      >
        <button
          type="button"
          onClick={() => navigate(`/${day.key}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: color.muted,
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="ChevronLeft" size={14} /> {day.name}
        </button>
        <div style={{
          marginTop: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.28em',
          color: accent,
          textTransform: 'uppercase',
        }}>
          {day.name} · Section
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 6,
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            lineHeight: 1,
            margin: 0,
            color: color.text,
          }}>
            {section.title.toUpperCase()}
          </h1>
          {section.mandatory && <Badge tone="warn">Mandatory</Badge>}
        </div>
        {section.blurb && (
          <p style={{
            margin: '10px 0 0',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: color.muted,
            lineHeight: 1.55,
          }}>
            {section.blurb}
          </p>
        )}
      </motion.header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {section.exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            accent={accent}
            index={i}
            onOpen={() => {
              haptic('select');
              setOpen(ex);
            }}
          />
        ))}
      </div>

      <ExerciseSheet open={!!open} onClose={() => setOpen(null)} exercise={open} accent={accent} />
    </main>
  );
}
