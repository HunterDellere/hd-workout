// v2 primitive: Stack — vertical or horizontal flex layout with token-spaced gap.
// Spacing values map to tokens `space` scale by numeric key.

import { space as spaceScale } from '../tokens';

function resolveGap(g) {
  if (typeof g === 'number' && spaceScale[g] != null) return spaceScale[g];
  if (typeof g === 'number') return g;
  return 0;
}

export function Stack({
  as: As = 'div',
  direction = 'column',
  gap = 0,
  align,
  justify,
  wrap = false,
  inline = false,
  style,
  children,
  ...rest
}) {
  const computed = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    gap: resolveGap(gap),
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : undefined,
    minWidth: 0,
    ...style,
  };
  return <As style={computed} {...rest}>{children}</As>;
}
