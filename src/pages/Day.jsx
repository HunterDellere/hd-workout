import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDay } from '../data';
import { color, accentFor, motion as M, Badge, Icon } from '../design-system';
import { SectionPill } from '../components/SectionPill';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { useHaptics } from '../hooks/useHaptics';

export function Day() {
  const { dayKey } = useParams();
  const navigate = useNavigate();
  const haptic = useHaptics();
  const day = useMemo(() => getDay(dayKey), [dayKey]);
  // Reset transient state when the day route changes by using dayKey as a
  // local "previous" reference (React-recommended pattern, avoids effects).
  const [prevDayKey, setPrevDayKey] = useState(dayKey);
  const [activeKey, setActiveKey] = useState(day?.sections?.[0]?.key ?? null);
  const [openExercise, setOpenExercise] = useState(null);
  const sectionRefs = useRef({});
  if (dayKey !== prevDayKey) {
    setPrevDayKey(dayKey);
    setActiveKey(day?.sections?.[0]?.key ?? null);
    setOpenExercise(null);
  }

  if (!day) {
    return (
      <main style={{ padding: 24, color: color.text, maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-body)' }}>Unknown day.</p>
        <button onClick={() => navigate('/')}>Back home</button>
      </main>
    );
  }

  const accent = accentFor(day.key);

  const scrollToSection = (key) => {
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveKey(key);
      haptic('light');
    }
  };

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
          onClick={() => navigate('/')}
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
          <Icon name="ChevronLeft" size={14} /> Home
        </button>
        <div style={{
          marginTop: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.28em',
          color: accent,
          textTransform: 'uppercase',
        }}>
          Day · {day.key}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(56px, 14vw, 96px)',
          lineHeight: 0.92,
          margin: '6px 0 0',
          color: color.text,
          letterSpacing: '0.005em',
        }}>
          {day.name.toUpperCase()}
        </h1>
        <p style={{
          marginTop: 10,
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: color.muted,
          lineHeight: 1.55,
          maxWidth: 540,
        }}>
          {day.description}
        </p>
      </motion.header>

      <div
        role="tablist"
        aria-label="Sections"
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 6,
          margin: '0 -16px 16px',
          paddingLeft: 16,
          paddingRight: 16,
          scrollbarWidth: 'none',
        }}
      >
        {day.sections.map((s) => (
          <SectionPill
            key={s.key}
            active={activeKey === s.key}
            mandatory={s.mandatory}
            accent={accent}
            onClick={() => scrollToSection(s.key)}
          >
            {s.title.split(' — ')[1] || s.title}
          </SectionPill>
        ))}
      </div>

      {day.sections.map((section) => (
        <section
          key={section.key}
          ref={(el) => { sectionRefs.current[section.key] = el; }}
          style={{ marginBottom: 28, scrollMarginTop: 16 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                lineHeight: 1,
                margin: 0,
                color: color.text,
                letterSpacing: '0.01em',
              }}>
                {section.title.toUpperCase()}
              </h2>
              {section.blurb && (
                <p style={{
                  margin: '6px 0 0',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: color.muted,
                  lineHeight: 1.5,
                }}>
                  {section.blurb}
                </p>
              )}
            </div>
            {section.mandatory && (
              <Badge tone="warn">Mandatory</Badge>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {section.exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                accent={accent}
                index={i}
                onOpen={() => {
                  haptic('select');
                  setOpenExercise(ex);
                }}
              />
            ))}
          </div>
        </section>
      ))}

      <ExerciseSheet
        open={!!openExercise}
        onClose={() => setOpenExercise(null)}
        exercise={openExercise}
        accent={accent}
      />
    </main>
  );
}
