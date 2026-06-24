import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { HeartBurst } from '@/components/HeartBurst';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import { categoryMap } from '@/data/categories';
import { formatDate } from '@/lib/date';
import type { CategoryId } from '@/types';
import './Daily.css';

export function Daily() {
  const daily = useDailyQuestion();
  const addSaved = useAppStore((s) => s.addSaved);
  const incrementAnswered = useAppStore((s) => s.incrementAnswered);
  const play = useSound();
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(0);

  const cat = categoryMap[daily.category];

  const save = () => {
    play('reveal');
    addSaved({
      questionId: daily.id,
      questionText: daily.text,
      category: daily.category as CategoryId,
    });
    incrementAnswered();
    setSaved(true);
    setBurst((b) => b + 1);
  };

  return (
    <div className="page daily">
      {burst > 0 && <HeartBurst key={burst} count={16} />}
      <PageHeader eyebrow={formatDate(Date.now())} title="השאלה היומית" />

      <motion.div
        className="daily__card glass"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="chip daily__chip">
          {cat && <Icon name={cat.icon} />} {cat?.title}
        </span>
        <div className="daily__sun">
          <Icon name="sun" />
        </div>
        <p className="daily__q">{daily.text}</p>
        <p className="daily__note">
          קחו רגע, שבו אחד מול השני, וענו בלי למהר. זו השאלה של היום.
        </p>
      </motion.div>

      <Button block size="lg" onClick={save} disabled={saved} className={`heart-btn${saved ? ' is-saved' : ''}`}>
        <Icon name="heart" size={18} /> {saved ? 'נשמר לזכרונות' : 'שמרו את הרגע הזה'}
      </Button>
    </div>
  );
}
