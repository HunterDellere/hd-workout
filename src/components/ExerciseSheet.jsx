import { Sheet, Badge, Divider, Icon, color, withAlpha, tierMeta } from '../design-system';
import { VariantList } from './VariantList';

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: color.s2,
      border: `1px solid ${color.border}`,
      borderRadius: 10,
      minWidth: 0,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: color.muted,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        marginTop: 4,
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        color: accent || color.text,
        letterSpacing: '-0.005em',
      }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, accent, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
      }}>
        <span
          aria-hidden
          style={{
            width: 4, height: 14, borderRadius: 2, background: accent,
          }}
        />
        <h3 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: color.text,
          margin: 0,
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items, tone = 'muted', accent }) {
  const dotColor = tone === 'warn' ? color.warn : accent || color.muted;
  return (
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.5,
            color: color.text,
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              marginTop: 7,
              width: 5,
              height: 5,
              borderRadius: 999,
              background: dotColor,
            }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ExerciseSheet({ open, onClose, exercise, accent }) {
  if (!exercise) {
    return <Sheet open={open} onClose={onClose} ariaLabel="Exercise detail" />;
  }
  const tm = tierMeta[exercise.tier];
  return (
    <Sheet open={open} onClose={onClose} ariaLabel={exercise.name}>
      <div style={{ padding: '8px 20px 96px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          paddingBottom: 4,
        }}>
          <span style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: exercise.tier === 'S' ? accent : withAlpha(accent, 0.18),
            color: exercise.tier === 'S' ? color.bg : accent,
            borderRadius: 10,
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            {tm?.glyph ?? exercise.tier}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: accent,
              textTransform: 'uppercase',
            }}>
              Tier · {tm?.label}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 38,
              lineHeight: 1.02,
              color: color.text,
              margin: '6px 0 0',
              letterSpacing: '0.005em',
            }}>
              {exercise.name.toUpperCase()}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: color.s2,
              border: `1px solid ${color.border}`,
              color: color.text,
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 8,
          marginTop: 16,
        }}>
          <Stat label="Sets" value={exercise.sets} accent={accent} />
          <Stat label="Rest" value={exercise.rest} accent={accent} />
        </div>

        {exercise.equipment?.length > 0 && (
          <Section title="Equipment" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {exercise.equipment.map((e) => (
                <Badge key={e} tone="outline" accent={accent}>{e}</Badge>
              ))}
            </div>
          </Section>
        )}

        {(exercise.primaryMuscles?.length > 0 || exercise.secondaryMuscles?.length > 0) && (
          <Section title="Muscles Worked" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {exercise.primaryMuscles?.map((m) => (
                <Badge key={`p-${m}`} tone="soft" accent={accent}>{m}</Badge>
              ))}
              {exercise.secondaryMuscles?.map((m) => (
                <Badge key={`s-${m}`} tone="muted">{m}</Badge>
              ))}
            </div>
          </Section>
        )}

        {exercise.cues?.length > 0 && (
          <Section title="Technique Cues" accent={accent}>
            <BulletList items={exercise.cues} accent={accent} />
          </Section>
        )}

        {exercise.safetyNotes?.length > 0 && (
          <Section title="Safety" accent={color.warn}>
            <BulletList items={exercise.safetyNotes} tone="warn" />
          </Section>
        )}

        {exercise.variants?.length > 0 && (
          <Section title="Variants" accent={accent}>
            <VariantList variants={exercise.variants} accent={accent} />
          </Section>
        )}

        {exercise.tags?.length > 0 && (
          <Section title="Tags" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {exercise.tags.map((t) => (
                <Badge key={t} tone="muted">{t}</Badge>
              ))}
            </div>
          </Section>
        )}
        <Divider />
      </div>
    </Sheet>
  );
}
