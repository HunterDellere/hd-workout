// Bottom navigation — three primary tabs only.
// Days live inside /library (the "By day" group) and are reachable by direct
// URL; the BottomNav stays disciplined. No blur, no neon, no gradients.

import { NavLink, useLocation } from 'react-router-dom';
import { NavIcon } from '../design-system/components';

const TABS = [
  { to: '/',        label: 'Home',    icon: 'home' },
  { to: '/today',   label: 'Today',   icon: 'today' },
  { to: '/library', label: 'Library', icon: 'library' },
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
          maxWidth: 480,
        }}
      >
        {TABS.map((t) => {
          const isActive =
            t.to === '/'
              ? location.pathname === '/'
              : location.pathname === t.to || location.pathname.startsWith(`${t.to}/`);

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
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'color 120ms ease',
                }}
              >
                <NavIcon name={t.icon} size={18} />
                {t.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
