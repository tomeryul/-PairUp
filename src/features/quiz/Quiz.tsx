import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { HeartBurst } from '@/components/HeartBurst';
import { quizQuestions } from '@/data/quiz';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import './Quiz.css';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Phase = 'intro' | 'guess' | 'actual' | 'feedback' | 'done';

const ROUNDS = 6;

export function Quiz() {
  const names = useAppStore((s) => s.names);
  const recordQuiz = useAppStore((s) => s.recordQuiz);
  const play = useSound();

  const deck = useMemo(() => shuffle(quizQuestions).slice(0, ROUNDS), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [burst, setBurst] = useState(0);

  const q = deck[round];

  const start = () => {
    play('tap');
    setPhase('guess');
  };

  const pickGuess = (i: number) => {
    play('tap');
    setGuess(i);
    setPhase('actual');
  };

  const pickActual = (i: number) => {
    setActual(i);
    const correct = i === guess;
    if (correct) {
      play('success');
      setScore((s) => s + 1);
    } else {
      play('pop');
    }
    setPhase('feedback');
  };

  const next = () => {
    play('tap');
    if (round + 1 >= deck.length) {
      const percent = (score / deck.length) * 100;
      recordQuiz(percent);
      setBurst((b) => b + 1);
      setPhase('done');
    } else {
      setRound((r) => r + 1);
      setGuess(null);
      setActual(null);
      setPhase('guess');
    }
  };

  const restart = () => {
    play('tap');
    setRound(0);
    setScore(0);
    setGuess(null);
    setActual(null);
    setPhase('intro');
  };

  const percent = Math.round((score / deck.length) * 100);
  const verdict =
    percent === 100
      ? 'נשמות תאומות'
      : percent >= 66
        ? 'אתם מכירים זה את זה מצוין'
        : percent >= 33
          ? 'יש עוד הרבה לגלות'
          : 'הרפתקה של היכרות מחכה לכם';

  return (
    <div className="page quiz">
      {burst > 0 && <HeartBurst key={burst} count={26} />}
      <PageHeader
        eyebrow="כמה אתם מכירים זה את זה?"
        title="חידון היכרות"
      />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="quiz__card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="quiz__icon">
              <Icon name="target" size={30} />
            </div>
            <p className="quiz__intro">
              ב-{deck.length} סבבים, {names.a} ינחש/תנחש מה {names.b} יענה/תענה.
              נראה כמה אתם באמת מכירים אחד את השני!
            </p>
            <Button block size="lg" onClick={start}>
              בואו נתחיל <Icon name="arrowL" size={18} />
            </Button>
          </motion.div>
        )}

        {(phase === 'guess' || phase === 'actual' || phase === 'feedback') && (
          <motion.div
            key={`q-${round}-${phase}`}
            className="quiz__card glass"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="quiz__progress">
              <span>סבב {round + 1} מתוך {deck.length}</span>
              <span>נקודות: {score}</span>
            </div>

            <p className="quiz__turn">
              {phase === 'guess' && `${names.a}: מה לדעתך ${names.b} יבחר/תבחר?`}
              {phase === 'actual' && `${names.b}: מה התשובה האמיתית שלך?`}
              {phase === 'feedback' &&
                (actual === guess ? 'פגעתם בול' : 'כמעט')}
            </p>
            <p className="quiz__q">{q.prompt}</p>

            <div className="quiz__options">
              {q.options.map((opt, i) => {
                const isGuess = guess === i;
                const isActual = actual === i;
                let state = '';
                if (phase === 'feedback') {
                  if (isActual) state = ' is-correct';
                  else if (isGuess) state = ' is-wrong';
                } else if (phase === 'actual' && isGuess) {
                  state = ' is-guessed';
                }
                return (
                  <button
                    key={i}
                    className={`quiz__opt${state}`}
                    disabled={phase === 'feedback'}
                    onClick={() =>
                      phase === 'guess' ? pickGuess(i) : phase === 'actual' && pickActual(i)
                    }
                  >
                    <span>{opt}</span>
                    {phase === 'feedback' && isActual && <Icon name="check" />}
                    {phase === 'actual' && isGuess && <small>הניחוש</small>}
                  </button>
                );
              })}
            </div>

            {phase === 'feedback' && (
              <Button block onClick={next}>
                {round + 1 >= deck.length ? 'לתוצאות' : 'הסבב הבא'}{' '}
                <Icon name="arrowL" size={18} />
              </Button>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            className="quiz__card glass quiz__done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="quiz__score-ring">
              <span className="quiz__score-num">{percent}%</span>
              <span className="quiz__score-label">תאימות</span>
            </div>
            <h2 className="quiz__verdict">{verdict}</h2>
            <p className="quiz__verdict-sub">
              ניחשתם נכון {score} מתוך {deck.length}
            </p>
            <Button block size="lg" onClick={restart}>
              שחקו שוב
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
