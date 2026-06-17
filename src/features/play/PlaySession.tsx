import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HeartBurst } from '@/components/HeartBurst';
import { categoryMap } from '@/data/categories';
import { questionsByCategory } from '@/data/questions';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import type { CategoryId } from '@/types';
import './PlaySession.css';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Phase = 'card' | 'answerA' | 'answerB' | 'reveal';

export function PlaySession() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const play = useSound();
  const names = useAppStore((s) => s.names);
  const addSaved = useAppStore((s) => s.addSaved);
  const incrementAnswered = useAppStore((s) => s.incrementAnswered);

  const category = categoryMap[categoryId ?? ''] ?? categoryMap.deep;
  const deck = useMemo(
    () => shuffle(questionsByCategory(category.id as CategoryId)),
    [category.id],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('card');
  const [answerA, setAnswerA] = useState('');
  const [answerB, setAnswerB] = useState('');
  const [revealB, setRevealB] = useState(false);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(0);

  const question = deck[index % deck.length];

  const resetTurn = () => {
    setAnswerA('');
    setAnswerB('');
    setRevealB(false);
    setPhase('card');
    setSaved(false);
  };

  const nextQuestion = () => {
    play('pop');
    incrementAnswered();
    setIndex((i) => i + 1);
    resetTurn();
  };

  const saveCurrent = (withAnswers: boolean) => {
    play('reveal');
    addSaved({
      questionId: question.id,
      questionText: question.text,
      category: category.id as CategoryId,
      answerA: withAnswers ? answerA.trim() || undefined : undefined,
      answerB: withAnswers ? answerB.trim() || undefined : undefined,
    });
    setSaved(true);
    setBurst((b) => b + 1);
  };

  return (
    <div className="page play">
      {burst > 0 && <HeartBurst key={burst} count={14} />}

      <header className="play__top">
        <button className="play__back" onClick={() => navigate(-1)} aria-label="חזור">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="chip">
          {category.emoji} {category.title}
        </div>
        <div className="play__counter">{(index % deck.length) + 1}/{deck.length}</div>
      </header>

      <div className="play__stage">
        <AnimatePresence mode="wait">
          {phase === 'card' && (
            <motion.div
              key={`card-${index}`}
              className="play__card glass"
              initial={{ opacity: 0, y: 40, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -40, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="play__quote">”</span>
              <p className="play__question">{question.text}</p>
              <span className="play__hint">
                {saved ? '✓ נשמר לזכרונות' : 'קחו את הזמן, אין תשובות נכונות'}
              </span>
            </motion.div>
          )}

          {(phase === 'answerA' || phase === 'answerB') && (
            <motion.div
              key={phase}
              className="play__card glass play__card--answer"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="chip play__turn-chip">
                תורו של {phase === 'answerA' ? names.a : names.b}
              </div>
              <p className="play__question play__question--sm">{question.text}</p>
              <textarea
                className="textarea play__answer"
                rows={5}
                autoFocus
                placeholder="כתבו כאן את התשובה..."
                value={phase === 'answerA' ? answerA : answerB}
                onChange={(e) =>
                  phase === 'answerA'
                    ? setAnswerA(e.target.value)
                    : setAnswerB(e.target.value)
                }
              />
            </motion.div>
          )}

          {phase === 'reveal' && (
            <motion.div
              key="reveal"
              className="play__reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <p className="play__question play__question--sm play__reveal-q">
                {question.text}
              </p>
              <motion.div
                className="play__bubble glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <span className="play__bubble-name">{names.a}</span>
                <p>{answerA.trim() || '—'}</p>
              </motion.div>

              {revealB ? (
                <motion.div
                  className="play__bubble glass play__bubble--b"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                >
                  <span className="play__bubble-name">{names.b}</span>
                  <p>{answerB.trim() || '—'}</p>
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  block
                  onClick={() => {
                    play('reveal');
                    setRevealB(true);
                  }}
                >
                  גלו את התשובה של {names.b} ✨
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="play__actions">
        {phase === 'card' && (
          <>
            <Button
              variant="ghost"
              block
              onClick={() => {
                play('tap');
                setPhase('answerA');
              }}
            >
              ✍️ ענו בתורות
            </Button>
            <div className="play__row">
              <Button
                variant="ghost"
                onClick={() => saveCurrent(false)}
                disabled={saved}
                className="play__icon-btn"
              >
                {saved ? '💖' : '🤍'} שמור
              </Button>
              <Button block onClick={nextQuestion}>
                השאלה הבאה ←
              </Button>
            </div>
          </>
        )}

        {phase === 'answerA' && (
          <Button
            block
            size="lg"
            onClick={() => {
              play('tap');
              setPhase('answerB');
            }}
          >
            עכשיו תורו של {names.b} ←
          </Button>
        )}

        {phase === 'answerB' && (
          <Button
            block
            size="lg"
            onClick={() => {
              play('reveal');
              setPhase('reveal');
            }}
          >
            גלו את התשובות 🎭
          </Button>
        )}

        {phase === 'reveal' && (
          <div className="play__row">
            <Button
              variant="ghost"
              onClick={() => saveCurrent(true)}
              disabled={saved}
            >
              {saved ? '💖' : '🤍'} לזכרונות
            </Button>
            <Button block onClick={nextQuestion}>
              שאלה הבאה ←
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
