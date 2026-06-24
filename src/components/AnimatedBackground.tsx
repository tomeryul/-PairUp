import { memo } from 'react';
import './AnimatedBackground.css';

/** Ambient animated gradient orbs + drifting hearts behind the whole app. */
function AnimatedBackgroundBase() {
  return (
    <div className="bg-ambient" aria-hidden="true">
      <div className="bg-base" />
      <div className="orb orb--rose" />
      <div className="orb orb--violet" />
      <div className="orb orb--gold" />
      <div className="bg-grain" />
    </div>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundBase);
