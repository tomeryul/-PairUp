import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import './Onboarding.css';

const slides: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'heart',
    title: 'ברוכים הבאים ל-PairUp',
    body: 'המקום שבו השיחות שלכם הופכות לחוויה. שאלות עמוקות, צחוקים וזכרונות — הכול במקום אחד.',
  },
  {
    icon: 'chat',
    title: 'שיחות שמקרבות',
    body: 'בחרו קטגוריה, ענו בתורות, וגלו זה את זה מחדש בכל פעם. שמרו את הרגעים היפים שלכם לתמיד.',
  },
  {
    icon: 'clock',
    title: 'קפסולות לעתיד',
    body: 'כתבו מסרים שייפתחו בתאריך עתידי, אספו הישגים, ושמרו על רצף שיחות יומי.',
  },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const complete = useAppStore((s) => s.completeOnboarding);
  const play = useSound();

  const isNames = step === slides.length;

  const next = () => {
    play('tap');
    setStep((s) => s + 1);
  };

  const finish = () => {
    play('success');
    complete({
      a: nameA.trim() || 'אני',
      b: nameB.trim() || 'אהובה שלי',
    });
  };

  return (
    <div className="onboarding app-container">
      <div className="onboarding__inner">
        <AnimatePresence mode="wait">
          {!isNames ? (
            <motion.div
              key={step}
              className="onboarding__slide"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="onboarding__emoji"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name={slides[step].icon} />
              </motion.div>
              <h1 className="onboarding__title">{slides[step].title}</h1>
              <p className="onboarding__body">{slides[step].body}</p>
            </motion.div>
          ) : (
            <motion.div
              key="names"
              className="onboarding__slide"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="onboarding__emoji">
                <Icon name="users" />
              </div>
              <h1 className="onboarding__title">איך קוראים לכם?</h1>
              <p className="onboarding__body">
                כדי שנוכל להפוך את החוויה לאישית שלכם.
              </p>
              <div className="onboarding__form glass">
                <label className="field">
                  <span className="field__label">השם שלך</span>
                  <input
                    className="input"
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    placeholder="לדוגמה: תומר"
                    maxLength={20}
                  />
                </label>
                <label className="field">
                  <span className="field__label">השם של בן/בת הזוג</span>
                  <input
                    className="input"
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    placeholder="לדוגמה: נועה"
                    maxLength={20}
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="onboarding__footer">
          <div className="onboarding__dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`onboarding__dot${i === step ? ' is-active' : ''}`}
              />
            ))}
            <span
              className={`onboarding__dot${isNames ? ' is-active' : ''}`}
            />
          </div>
          {isNames ? (
            <Button size="lg" block onClick={finish}>
              בואו נתחיל
            </Button>
          ) : (
            <Button size="lg" block onClick={next}>
              המשך
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
