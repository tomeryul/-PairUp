import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import './BottomNav.css';

const items = [
  { to: '/', label: 'בית', icon: HomeIcon, end: true },
  { to: '/categories', label: 'שאלות', icon: ChatIcon },
  { to: '/journey', label: 'המסע', icon: HeartIcon },
  { to: '/capsules', label: 'קפסולות', icon: CapsuleIcon },
  { to: '/settings', label: 'עוד', icon: GridIcon },
];

export function BottomNav() {
  const play = useSound();
  return (
    <motion.nav
      className="bottom-nav glass"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.2 }}
    >
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => play('tap')}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? ' is-active' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="bottom-nav__pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="bottom-nav__icon">
                <Icon />
              </span>
              <span className="bottom-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M4 5h16v11H8l-4 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CapsuleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 8h6M12 12v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
