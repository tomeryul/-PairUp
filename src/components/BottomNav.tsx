import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { Icon, type IconName } from '@/components/ui/Icon';
import './BottomNav.css';

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'בית', icon: 'home', end: true },
  { to: '/date', label: 'דייט', icon: 'spark' },
  { to: '/categories', label: 'שאלות', icon: 'chat' },
  { to: '/journey', label: 'המסע', icon: 'heart' },
  { to: '/settings', label: 'עוד', icon: 'more' },
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
      {items.map(({ to, label, icon, end }) => (
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
              <Icon name={icon} size={21} />
              <span className="bottom-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
}
