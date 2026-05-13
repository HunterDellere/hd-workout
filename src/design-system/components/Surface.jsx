// v2 primitive: Surface — themed background container with optional hairline.
// Backgrounds use semantic CSS vars; switches automatically with theme.

const LEVEL_VAR = {
  page:    'var(--surface-page)',
  sunken:  'var(--surface-sunken)',
  raised:  'var(--surface-raised)',
  overlay: 'var(--surface-overlay)',
};

export function Surface({
  as: As = 'div',
  level = 'page',
  pad = 0,
  radius = 0,
  bordered = false,
  shadow = 0,
  style,
  children,
  ...rest
}) {
  const padPx = typeof pad === 'number' ? pad : 0;
  const computed = {
    background: LEVEL_VAR[level] ?? LEVEL_VAR.page,
    color: 'var(--text-primary)',
    padding: padPx ? `${padPx}px` : undefined,
    borderRadius: radius || undefined,
    border: bordered ? '1px solid var(--border-hairline)' : undefined,
    boxShadow: shadow === 2 ? 'var(--shadow-2)' : shadow === 1 ? 'var(--shadow-1)' : undefined,
    ...style,
  };
  return <As style={computed} {...rest}>{children}</As>;
}
