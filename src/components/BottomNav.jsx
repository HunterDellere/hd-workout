import { NavLink, useLocation } from 'react-router-dom';
import { color, dayColor, withAlpha, z, Icon } from '../design-system';

const TABS = [
  { to: '/',     label: 'Home', icon: 'Home',     accent: color.text },
  { to: '/push', label: 'Push', icon: 'Dumbbell', accent: dayColor.push },
  { to: '/pull', label: 'Pull', icon: 'MoveDown', accent: dayColor.pull },
  { to: '/legs', label: 'Legs', icon: 'Footprints', accent: dayColor.legs },
  { to: '/core', label: 'Core', icon: 'Target',   accent: dayColor.core },
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
        background: `linear-gradient(180deg, ${withAlpha(color.bg, 0.85)}, ${color.bg})`,
        borderTop: `1px solid ${color.border}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: z.nav,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <ul style={{
        margin: 0,
        padding: '6px 4px',
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 2,
        maxWidth: 720,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {TABS.map((t) => {
          const isActive = t.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(t.to);
          return (
            <li key={t.to}>
              <NavLink
                to={t.to}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  textDecoration: 'none',
                  color: isActive ? t.accent : color.muted,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  borderRadius: 8,
                  background: isActive ? withAlpha(t.accent, 0.1) : 'transparent',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
              >
                <Icon name={t.icon} size={18} />
                {t.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
