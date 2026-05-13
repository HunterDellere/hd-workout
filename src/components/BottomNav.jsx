// Bottom navigation. Hairline border, paper surface, semantic accent only on
// the active item — the day's accent ink for the label, never as a fill or
// underline. No blur, no neon, no gradients. Bespoke 1.5px-stroke glyphs.

import { NavLink, useLocation } from 'react-router-dom';
import { NavIcon } from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';

// Days are icon-only — pattern recognition by colour + glyph, no label.
// Home + Library carry their labels because they're the primary IA.
const TABS = [
  { to: '/',        label: 'Home',    icon: 'home',    kind: 'label' },
  { to: '/today',   label: 'Today',   icon: 'today',   kind: 'label' },
  { to: '/library', label: 'Library', icon: 'library', kind: 'label' },
  { to: '/push',    label: 'Push',    icon: 'push',    accent: dayLineageAccent.push, kind: 'icon' },
  { to: '/pull',    label: 'Pull',    icon: 'pull',    accent: dayLineageAccent.pull, kind: 'icon' },
  { to: '/legs',    label: 'Legs',    icon: 'legs',    accent: dayLineageAccent.legs, kind: 'icon' },
  { to: '/core',    label: 'Core',    icon: 'core',    accent: dayLineageAccent.core, kind: 'icon' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--surface-page)',
        borderTop: '1px solid var(--border-hairline)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <ul
        style={{
          margin: '0 auto',
          padding: '8px 4px',
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
          gap: 0,
          maxWidth: 720,
        }}
      >
        {TABS.map((t) => {
          const isActive =
            t.to === '/'
              ? location.pathname === '/'
              : location.pathname === t.to || location.pathname.startsWith(`${t.to}/`);

          const activeInk = t.accent
            ? `var(--accent-${t.accent}-ink)`
            : 'var(--text-primary)';

          const iconOnly = t.kind === 'icon';

          return (
            <li key={t.to}>
              <NavLink
                to={t.to}
                aria-label={iconOnly ? t.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  textDecoration: 'none',
                  color: isActive ? activeInk : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'color 120ms ease',
                }}
              >
                <NavIcon name={t.icon} size={18} />
                {!iconOnly && t.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
