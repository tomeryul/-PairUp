import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HeartBurst } from '@/components/HeartBurst';
import { useSound } from '@/hooks/useSound';
import { useAppStore } from '@/store/useAppStore';
import {
  birthdayGreeting,
  loveLetter,
  whyILoveYou,
  milestones,
  finalSurprise,
} from '@/data/birthday';
import './Birthday.css';

type Step = 'greeting' | 'letter' | 'why' | 'timeline' | 'final';
const order: Step[] = ['greeting', 'letter', 'why', 'timeline', 'final'];

export function Birthday() {
  const navigate = useNavigate();
  const play = useSound();
  const customLetter = useAppStore((s) => s.birthdayLetter);
  const [step, setStep] = useState<Step>('greeting');
  const [burst, setBurst] = useState(1);

  useEffect(() => {
    play('sparkle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (next: Step) => {
    play('reveal');
    setStep(next);
    setBurst((b) => b + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const idx = order.indexOf(step);
  const nextStep = order[idx + 1];

  return (
    <div className="bday">
      <div className="bday__hearts" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="bday__heart"
            initial={{ y: '110vh', opacity: 0 }}
            animate={{ y: '-12vh', opacity: [0, 0.8, 0.8, 0] }}
            transition={{
              duration: 7 + (i % 5),
              delay: i * 0.6,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ insetInlineStart: `${(i * 7) % 100}%`, fontSize: `${14 + (i % 4) * 8}px` }}
          >
            {['❤️', '💛', '💜', '✨', '💕'][i % 5]}
          </motion.span>
        ))}
      </div>

      {burst > 0 && <HeartBurst key={burst} count={30} />}

      <button className="bday__exit" onClick={() => navigate('/')} aria-label="חזרה">
        ✕
      </button>

      <div className="app-container bday__content">
        <AnimatePresence mode="wait">
          {step === 'greeting' && (
            <motion.section
              key="greeting"
              className="bday__section bday__greeting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="bday__cake"
                animate={{ y: [0, -14, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                🎂
              </motion.div>
              <p className="bday__hi">{birthdayGreeting.title},</p>
              <h1 className="bday__name">{birthdayGreeting.name}</h1>
              <p className="bday__sub">{birthdayGreeting.subtitle}</p>
              <Button size="lg" onClick={() => go('letter')}>
                פתחי את המתנה שלך 💝
              </Button>
            </motion.section>
          )}

          {step === 'letter' && (
            <motion.section
              key="letter"
              className="bday__section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="bday__h2">מכתב אהבה 💌</h2>
              <div className="bday__letter glass">
                {(customLetter || loveLetter).split('\n\n').map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.25 }}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
              <Button size="lg" onClick={() => go('why')}>
                למה אני אוהב אותך →
              </Button>
            </motion.section>
          )}

          {step === 'why' && (
            <motion.section
              key="why"
              className="bday__section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="bday__h2">למה אני אוהב אותך</h2>
              <div className="bday__why-grid">
                {whyILoveYou.map((card, i) => (
                  <motion.div
                    key={card.title}
                    className="bday__why glass"
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.12, type: 'spring', stiffness: 200, damping: 18 }}
                  >
                    <span className="bday__why-emoji">{card.emoji}</span>
                    <h3 className="bday__why-title">{card.title}</h3>
                    <p className="bday__why-body">{card.body}</p>
                  </motion.div>
                ))}
              </div>
              <Button size="lg" onClick={() => go('timeline')}>
                המסע שלנו →
              </Button>
            </motion.section>
          )}

          {step === 'timeline' && (
            <motion.section
              key="timeline"
              className="bday__section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="bday__h2">הסיפור שלנו 💞</h2>
              <div className="bday__timeline">
                {milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    className="bday__milestone"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.18 }}
                  >
                    <span className="bday__milestone-emoji">{m.emoji}</span>
                    <div className="bday__milestone-card glass">
                      <span className="bday__milestone-date">{m.date}</span>
                      <h3 className="bday__milestone-title">{m.title}</h3>
                      <p className="bday__milestone-desc">{m.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button size="lg" onClick={() => go('final')}>
                יש עוד דבר אחד... ✨
              </Button>
            </motion.section>
          )}

          {step === 'final' && (
            <motion.section
              key="final"
              className="bday__section bday__final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="bday__final-glow"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="bday__final-emoji"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                💍
              </motion.div>
              <h2 className="bday__final-title">{finalSurprise.title}</h2>
              <p className="bday__final-msg">{finalSurprise.message}</p>
              <p className="bday__final-sign">{finalSurprise.signature}</p>
              <Button variant="ghost" onClick={() => { play('tap'); navigate('/'); }}>
                חזרה לאפליקציה
              </Button>
            </motion.section>
          )}
        </AnimatePresence>

        {nextStep && step !== 'greeting' && (
          <div className="bday__progress">
            {order.slice(1).map((s) => (
              <span
                key={s}
                className={`bday__progress-dot${order.indexOf(s) <= idx ? ' is-active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
