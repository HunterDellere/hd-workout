// Block — a vertical-rhythm section inside a Page.
// Optional mono eyebrow + serif heading. Pads above; the layout primitive,
// not the content, owns the gap between blocks.
//
// Named Block (not Section) because <Section> already exists in this
// codebase as a route component (src/pages/Section.jsx), and the v2 path
// also exports a different `Stack`. Block keeps the name space clean.

import { Text } from './Text';

export function Block({
  as: As = 'section',
  eyebrow,
  heading,
  headingVariant = 'title-lg',
  gapTop = 48,
  gapInner = 16,
  style,
  children,
  ...rest
}) {
  const computed = {
    paddingTop: gapTop,
    ...style,
  };

  return (
    <As style={computed} {...rest}>
      {eyebrow && (
        <Text
          as="div"
          variant="mono-sm"
          tone="tertiary"
          style={{ textTransform: 'uppercase', marginBottom: 12 }}
        >
          {eyebrow}
        </Text>
      )}
      {heading && (
        <Text
          as="h2"
          variant={headingVariant}
          tone="primary"
          style={{ marginBottom: gapInner }}
        >
          {heading}
        </Text>
      )}
      {children}
    </As>
  );
}
