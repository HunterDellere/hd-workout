import { color, radius, withAlpha } from '../design-system';

export function VariantList({ variants, accent }) {
  if (!variants?.length) return null;
  return (
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {variants.map((v) => (
        <li
          key={v.name}
          style={{
            position: 'relative',
            padding: '12px 14px 12px 16px',
            background: color.s2,
            border: `1px solid ${color.border}`,
            borderRadius: radius.md,
            overflow: 'hidden',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0, top: 8, bottom: 8,
              width: 2,
              background: withAlpha(accent, 0.6),
              borderRadius: 99,
            }}
          />
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 14,
            color: color.text,
            lineHeight: 1.3,
          }}>
            {v.name}
          </div>
          <div style={{
            marginTop: 4,
            fontFamily: 'var(--font-body)',
            fontSize: 12.5,
            color: color.muted,
            lineHeight: 1.45,
          }}>
            {v.note}
          </div>
        </li>
      ))}
    </ul>
  );
}
