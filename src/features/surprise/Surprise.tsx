import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { surprises } from '@/data/surprises';
import { useSound } from '@/hooks/useSound';
import './Surprise.css';

export function Surprise() {
  const play = useSound();
  const [current, setCurrent] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const roll = () => {
    play('sparkle');
    setSpinning(true);
    let ticks = 0;
    const interval = setInterval(() => {
      setCurrent(Math.floor(Math.random() * surprises.length));
      ticks++;
      if (ticks > 8) {
        clearInterval(interval);
        setSpinning(false);
        play('success');
      }
    }, 70);
  };

  const item = current !== null ? surprises[current] : null;

  return (
    <div className="page surprise">
      <PageHeader
        eyebrow="צריך רעיון?"
        title="הפתעה"
        subtitle="אתגר רומנטי, רעיון לדייט או פעילות זוגית — באקראי, רק בשבילכם."
      />

      <div className="surprise__stage">
        <AnimatePresence mode="wait">
          {item ? (
            <motion.div
              key={current}
              className="surprise__card glass"
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <span className="surprise__type chip">{item.type}</span>
              <motion.div
                className="surprise__emoji"
                animate={spinning ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                {item.emoji}
              </motion.div>
              <p className="surprise__text">{item.text}</p>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="surprise__card glass surprise__card--empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="surprise__emoji"
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                🎁
              </motion.div>
              <p className="surprise__text surprise__text--muted">
                לחצו על הכפתור כדי לגלות את ההפתעה שלכם
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button block size="lg" onClick={roll} disabled={spinning}>
        {current === null ? 'הפתיעו אותי ✨' : 'הפתעה נוספת 🎲'}
      </Button>
    </div>
  );
}
