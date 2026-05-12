import { color } from '../tokens';

export function Divider({ label, accent, vertical }) {
  if (vertical) {
    return (
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 1,
          alignSelf: 'stretch',
          background: color.border,
          margin: '0 8px',
        }}
      />
    );
  }
  if (!label) {
    return (
      <hr
        style={{
          border: 0,
          borderTop: `1px solid ${color.border}`,
          margin: '16px 0',
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        margin: '20px 0 12px',
      }}
    >
      <span
        style={{
          flex: 1,
          height: 1,
          background: color.border,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: accent || color.muted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          height: 1,
          background: color.border,
        }}
      />
    </div>
  );
}
