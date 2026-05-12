import { color, radius, withAlpha } from '../design-system';

export function PrinciplesBar({ principles, injuryPrevention, accent }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ width: 4, height: 14, background: accent, borderRadius: 2 }} />
        <h2 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: color.text,
          margin: 0,
        }}>
          Training Principles
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gap: 8,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {principles.map((p) => (
          <article
            key={p.id}
            style={{
              background: color.s1,
              border: `1px solid ${color.border}`,
              borderRadius: radius.lg,
              padding: 14,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: accent,
              textTransform: 'uppercase',
            }}>
              {p.tags?.[0]}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 500,
              marginTop: 4,
              color: color.text,
            }}>
              {p.title}
            </div>
            <p style={{
              margin: '6px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: color.muted,
              lineHeight: 1.5,
            }}>
              {p.body}
            </p>
          </article>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: '28px 0 12px',
      }}>
        <span style={{ width: 4, height: 14, background: color.warn, borderRadius: 2 }} />
        <h2 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: color.text,
          margin: 0,
        }}>
          Injury Prevention
        </h2>
      </div>
      <div style={{
        display: 'grid',
        gap: 8,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {injuryPrevention.map((p) => (
          <article
            key={p.id}
            style={{
              background: color.s1,
              border: `1px solid ${p.severity === 'high' ? withAlpha(color.warn, 0.3) : color.border}`,
              borderRadius: radius.lg,
              padding: 14,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: p.severity === 'high' ? color.warn : color.muted,
              textTransform: 'uppercase',
            }}>
              Severity · {p.severity}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 500,
              marginTop: 4,
              color: color.text,
            }}>
              {p.title}
            </div>
            <p style={{
              margin: '6px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: color.muted,
              lineHeight: 1.5,
            }}>
              {p.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
