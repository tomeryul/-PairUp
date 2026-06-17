import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeartBurstProps {
  count?: number;
  /** Emoji palette for the floating particles. */
  emojis?: string[];
}

/** A one-shot burst of floating emoji that drift upward and fade. */
export function HeartBurst({
  count = 18,
  emojis = ['❤️', '💛', '💜', '✨', '💕'],
}: HeartBurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 2,
        size: 16 + Math.random() * 24,
        drift: (Math.random() - 0.5) * 120,
        emoji: emojis[i % emojis.length],
      })),
    [count, emojis],
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 60,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '105vh', x: 0, opacity: 0, scale: 0.6 }}
          animate={{
            y: '-15vh',
            x: p.drift,
            opacity: [0, 1, 1, 0],
            scale: 1,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            insetInlineStart: `${p.left}%`,
            fontSize: p.size,
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
