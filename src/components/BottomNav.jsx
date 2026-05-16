// Bottom navigation — four primary tabs, each one job (per SITEMAP.md).
// Today is the cold-open (/) and owns "let's start." Log holds the history
// of work and the insights derived from it. Library is the reference.
// Me is settings + data + glossary + about. No blur, no neon, no gradients.

import { NavLink, useLocation } from 'react-router-dom';
import { NavIcon } from '../design-system/components';

const TABS = [
  { to: '/',        label: 'Today',   icon: 'today' },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/log',     label: 'Log',     icon: 'log' },
  { to: '/me',      label: 'You',     icon: 'profile' },
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
                  gap: 6,
                  padding: '10px 4px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  // Inter (not mono) — mono is reserved for data lines; nav
                  // labels are navigational, not metric. Slightly larger
                  // size and looser tracking land closer to "notebook" than
                  // the previous mono-as-chrome reading.
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'color 120ms ease',
                }}
              >
                <NavIcon name={t.icon} size={20} />
                {t.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
