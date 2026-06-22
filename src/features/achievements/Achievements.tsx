import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { achievements } from '@/data/achievements';
import { useAppStore } from '@/store/useAppStore';
import type { ProgressSnapshot } from '@/types';
import './Achievements.css';

export function Achievements() {
  const answeredCount = useAppStore((s) => s.answeredCount);
  const savedCount = useAppStore((s) => s.saved.length);
  const capsuleCount = useAppStore((s) => s.capsules.length);
  const quizPlays = useAppStore((s) => s.quizPlays);
  const streak = useAppStore((s) => s.streak);
  const bestQuizScore = useAppStore((s) => s.bestQuizScore);

  const snapshot = useMemo<ProgressSnapshot>(
    () => ({ answeredCount, savedCount, capsuleCount, quizPlays, streak, bestQuizScore }),
    [answeredCount, savedCount, capsuleCount, quizPlays, streak, bestQuizScore],
  );
  const unlocked = achievements.filter((a) => a.progress(snapshot) >= 1).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow={`${unlocked} מתוך ${achievements.length} נפתחו`}
        title="ההישגים שלנו"
        subtitle="כל שיחה, זיכרון וקפסולה מקרבים אתכם להישג הבא."
      />

      <div className="ach-list">
        {achievements.map((a, i) => {
          const progress = a.progress(snapshot);
          const done = progress >= 1;
          return (
            <motion.div
              key={a.id}
              className={`ach glass${done ? ' is-done' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`ach__badge${done ? ' is-done' : ''}`}>
                <Icon name={a.icon} />
              </div>
              <div className="ach__body">
                <div className="ach__head">
                  <h3 className="ach__title">{a.title}</h3>
                  {done && (
                    <span className="ach__check">
                      <Icon name="check" size={16} />
                    </span>
                  )}
                </div>
                <p className="ach__desc">{a.description}</p>
                <div className="ach__bar">
                  <motion.div
                    className="ach__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(progress * 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
