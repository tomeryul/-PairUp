import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeartBurstProps {
  count?: number;
  /** Colour palette for the floating particles. */
  colors?: string[];
}

const VINTAGE = ['#ef7fa3', '#c479a0', '#d85f86', '#ef9ec0', '#b98ac4', '#f3b6a0'];

/** A one-shot burst of small vintage dots that drift upward and fade. */
export function HeartBurst({ count = 18, colors = VINTAGE }: HeartBurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 2,
        size: 7 + Math.random() * 9,
        drift: (Math.random() - 0.5) * 120,
        color: colors[i % colors.length],
      })),
    [count, colors],
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
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            border: '1.5px solid #1a1a1a',
          }}
        />
      ))}
    </div>
  );
}
