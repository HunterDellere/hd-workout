import { color, radius } from '../tokens';

export function Tag({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        background: color.s2,
        color: color.muted,
        borderRadius: radius.xs,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'lowercase',
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  );
}
