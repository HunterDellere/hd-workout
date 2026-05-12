import * as Lucide from 'lucide-react';

// Thin wrapper so callers can do <Icon name="ChevronRight" /> without
// importing each icon individually. Falls back to a circle if name is bad.
export function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.8, ...rest }) {
  const Component = Lucide[name] || Lucide.Circle;
  return <Component size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
