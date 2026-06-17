import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { HeartBurst } from '@/components/HeartBurst';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import { questions } from '@/data/questions';
import { dares, type Dare } from '@/data/dares';
import { buildGptPrompt, chatGptUrl } from '@/lib/gptPrompt';
import { formatDate } from '@/lib/date';
import type { SessionQA } from '@/types';
import './DateSession.css';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Round =
  | { kind: 'question'; text: string }
  | { kind: 'dare'; dare: Dare };

const SESSION_CATS = ['deep', 'love', 'future', 'dreams', 'childhood'];

function buildPlan(total: number): Round[] {
  const numDares = Math.max(1, Math.round(total / 3));
  const numQ = total - numDares;
  const qs: Round[] = shuffle(
    questions.filter((q) => SESSION_CATS.includes(q.category)),
  )
    .slice(0, numQ)
    .map((q) => ({ kind: 'question', text: q.text }));
  const ds: Round[] = shuffle(dares)
    .slice(0, numDares)
    .map((d) => ({ kind: 'dare', dare: d }));

  // Interleave dares evenly between the questions.
  const plan = [...qs];
  const gap = Math.floor(plan.length / (ds.length + 1)) || 1;
  ds.forEach((d, i) => plan.splice((i + 1) * gap + i, 0, d));
  return plan;
}

type Phase = 'intro' | 'play' | 'summary';
type QSub = 'a' | 'b' | 'reveal';

export function DateSession() {
  const names = useAppStore((s) => s.names);
  const sessions = useAppStore((s) => s.sessions);
  const addSession = useAppStore((s) => s.addSession);
  const setSessionScore = useAppStore((s) => s.setSessionScore);
  const incrementAnswered = useAppStore((s) => s.incrementAnswered);
  const play = useSound();

  const [phase, setPhase] = useState<Phase>('intro');
  const [length, setLength] = useState(6);
  const [plan, setPlan] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [qsub, setQsub] = useState<QSub>('a');
  const [answerA, setAnswerA] = useState('');
  const [answerB, setAnswerB] = useState('');
  const [qa, setQa] = useState<SessionQA[]>([]);
  const [daresDone, setDaresDone] = useState(0);
  const [burst, setBurst] = useState(0);

  const daresTotal = useMemo(
    () => plan.filter((r) => r.kind === 'dare').length,
    [plan],
  );

  const start = () => {
    play('success');
    setPlan(buildPlan(length));
    setIdx(0);
    setQsub('a');
    setAnswerA('');
    setAnswerB('');
    setQa([]);
    setDaresDone(0);
    setPhase('play');
  };

  const advance = () => {
    if (idx + 1 >= plan.length) {
      play('success');
      setBurst((b) => b + 1);
      setPhase('summary');
    } else {
      setIdx((i) => i + 1);
      setQsub('a');
      setAnswerA('');
      setAnswerB('');
    }
  };

  const round = plan[idx];

  return (
    <div className="page date">
      {burst > 0 && <HeartBurst key={burst} count={26} />}

      {phase === 'intro' && (
        <IntroView
          names={names}
          length={length}
          setLength={setLength}
          onStart={start}
          sessions={sessions}
        />
      )}

      {phase === 'play' && round && (
        <div className="date__play">
          <div className="date__progress-row">
            <span className="chip">סבב {idx + 1} מתוך {plan.length}</span>
            <div className="date__bar">
              <div
                className="date__bar-fill"
                style={{ width: `${((idx + 1) / plan.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {round.kind === 'question' ? (
              <motion.div
                key={`q-${idx}-${qsub}`}
                className="date__card glass"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="chip date__kind">💬 שאלה</span>
                {qsub !== 'reveal' ? (
                  <>
                    <p className="date__q">{round.text}</p>
                    <div className="chip date__turn">
                      תורו של {qsub === 'a' ? names.a : names.b}
                    </div>
                    <textarea
                      className="textarea"
                      rows={4}
                      autoFocus
                      placeholder="כתבו כאן..."
                      value={qsub === 'a' ? answerA : answerB}
                      onChange={(e) =>
                        qsub === 'a'
                          ? setAnswerA(e.target.value)
                          : setAnswerB(e.target.value)
                      }
                    />
                    <Button
                      block
                      size="lg"
                      onClick={() => {
                        play('tap');
                        if (qsub === 'a') setQsub('b');
                        else setQsub('reveal');
                      }}
                    >
                      {qsub === 'a' ? `תורו של ${names.b} ←` : 'גלו תשובות 🎭'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="date__q date__q--sm">{round.text}</p>
                    <div className="date__bubble">
                      <b>{names.a}:</b> {answerA.trim() || '—'}
                    </div>
                    <div className="date__bubble date__bubble--b">
                      <b>{names.b}:</b> {answerB.trim() || '—'}
                    </div>
                    <Button
                      block
                      size="lg"
                      onClick={() => {
                        play('pop');
                        incrementAnswered();
                        setQa((prev) => [
                          ...prev,
                          { q: round.text, a: answerA.trim(), b: answerB.trim() },
                        ]);
                        advance();
                      }}
                    >
                      {idx + 1 >= plan.length ? 'לסיכום 🎉' : 'הסבב הבא ←'}
                    </Button>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`d-${idx}`}
                className="date__card glass date__card--dare"
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <span className="chip date__kind date__kind--dare">
                  🔥 אתגר · {round.dare.type}
                </span>
                <div className="date__dare-emoji">{round.dare.emoji}</div>
                <p className="date__dare-text">{round.dare.text}</p>
                <div className="date__dare-actions">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      play('tap');
                      advance();
                    }}
                  >
                    דילגנו
                  </Button>
                  <Button
                    block
                    onClick={() => {
                      play('success');
                      setDaresDone((n) => n + 1);
                      setBurst((b) => b + 1);
                      advance();
                    }}
                  >
                    ביצענו! ✅
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {phase === 'summary' && (
        <SummaryView
          names={names}
          qa={qa}
          daresDone={daresDone}
          daresTotal={daresTotal}
          addSession={addSession}
          setSessionScore={setSessionScore}
          previousBest={sessions.find((s) => s.gptScore != null)?.gptScore ?? null}
          onRestart={() => {
            play('tap');
            setPhase('intro');
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Intro ---------------- */
function IntroView({
  names,
  length,
  setLength,
  onStart,
  sessions,
}: {
  names: { a: string; b: string };
  length: number;
  setLength: (n: number) => void;
  onStart: () => void;
  sessions: ReturnType<typeof useAppStore.getState>['sessions'];
}) {
  const scored = sessions.filter((s) => s.gptScore != null);
  return (
    <>
      <PageHeader
        eyebrow="הופכים כל יציאה לחוויה"
        title="דייט"
        subtitle="התחילו סשן דייט — שאלות שמקרבות ואתגרים שמרגשים, עם ציון התאמה בסוף."
      />

      <div className="date__intro glass">
        <div className="date__intro-emoji">🥂</div>
        <p className="date__intro-text">
          {names.a} ו{names.b}, מוכנים? בחרו אורך סשן והתחילו.
        </p>
        <div className="date__lengths">
          {[
            { n: 4, label: 'קצר' },
            { n: 6, label: 'בינוני' },
            { n: 8, label: 'ארוך' },
          ].map((o) => (
            <button
              key={o.n}
              className={`date__length${length === o.n ? ' is-active' : ''}`}
              onClick={() => setLength(o.n)}
            >
              <span className="date__length-n">{o.n}</span>
              <span className="date__length-l">{o.label}</span>
            </button>
          ))}
        </div>
        <Button block size="lg" onClick={onStart}>
          בואו נתחיל 🔥
        </Button>
      </div>

      {scored.length > 0 && (
        <div className="date__history">
          <h3 className="date__history-title">הדייטים שלנו</h3>
          <div className="date__trend glass">
            {scored
              .slice(0, 8)
              .reverse()
              .map((s) => (
                <div key={s.id} className="date__trend-bar" title={`${s.gptScore}`}>
                  <div
                    className="date__trend-fill"
                    style={{ height: `${s.gptScore}%` }}
                  />
                  <span className="date__trend-val">{s.gptScore}</span>
                </div>
              ))}
          </div>
          <div className="date__history-list">
            {sessions.slice(0, 6).map((s) => (
              <div key={s.id} className="date__history-row glass">
                <span className="date__history-date">{formatDate(s.createdAt)}</span>
                <span className="date__history-meta">
                  🔥 {s.daresDone}/{s.daresTotal}
                  {s.gptScore != null && <> · 💞 {s.gptScore}</>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Summary ---------------- */
function SummaryView({
  names,
  qa,
  daresDone,
  daresTotal,
  addSession,
  setSessionScore,
  previousBest,
  onRestart,
}: {
  names: { a: string; b: string };
  qa: SessionQA[];
  daresDone: number;
  daresTotal: number;
  addSession: ReturnType<typeof useAppStore.getState>['addSession'];
  setSessionScore: ReturnType<typeof useAppStore.getState>['setSessionScore'];
  previousBest: number | null;
  onRestart: () => void;
}) {
  const play = useSound();
  const sessionIdRef = useRef<string | null>(null);
  // Capture the previous session's score once, BEFORE this session is saved,
  // so the improvement comparison isn't made against this same session.
  const prevScoreRef = useRef<number | null>(previousBest);
  const [score, setScore] = useState('');
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-save the session once when the summary opens.
  useEffect(() => {
    if (sessionIdRef.current) return;
    sessionIdRef.current = addSession({ daresDone, daresTotal, qa, gptScore: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prompt = useMemo(() => buildGptPrompt(names, qa), [names, qa]);

  const openGpt = () => {
    play('sparkle');
    window.open(chatGptUrl(prompt), '_blank', 'noopener');
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const saveScore = () => {
    const n = Math.max(0, Math.min(100, parseInt(score, 10)));
    if (Number.isNaN(n) || !sessionIdRef.current) return;
    play('success');
    setSessionScore(sessionIdRef.current, n);
    setSavedScore(n);
  };

  const prevScore = prevScoreRef.current;
  const delta =
    savedScore != null && prevScore != null ? savedScore - prevScore : null;

  return (
    <div className="date__summary">
      <PageHeader eyebrow="כל הכבוד 💛" title="סיכום הדייט" />

      <div className="date__stats glass">
        <div className="date__stat">
          <span className="date__stat-num">{daresDone}/{daresTotal}</span>
          <span className="date__stat-label">אתגרים</span>
        </div>
        <div className="date__stat">
          <span className="date__stat-num">{qa.length}</span>
          <span className="date__stat-label">שאלות</span>
        </div>
      </div>

      <div className="date__gpt glass">
        <h3 className="date__gpt-title">💞 ציון ההתאמה</h3>
        <p className="date__gpt-text">
          פתחו את ChatGPT עם הפרומפט המוכן (כולל התשובות שלכם), קבלו ציון התאמה,
          והזינו אותו כאן כדי לעקוב אם השתפרתם.
        </p>
        <Button block size="lg" onClick={openGpt}>
          נתחו את ההתאמה ב-ChatGPT ↗
        </Button>
        <Button variant="ghost" block onClick={copyPrompt}>
          {copied ? '✓ הפרומפט הועתק' : 'העתיקו את הפרומפט'}
        </Button>

        <div className="date__score-row">
          <input
            className="input date__score-input"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="ציון 0-100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <Button onClick={saveScore} disabled={!score}>
            שמרו ציון
          </Button>
        </div>

        {savedScore != null && (
          <motion.div
            className="date__result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="date__result-num gradient-text">{savedScore}</div>
            {delta != null && delta !== 0 && (
              <div className="date__result-delta">
                {delta > 0 ? `📈 השתפרתם ב-${delta} נקודות!` : `${delta} מהפעם הקודמת`}
              </div>
            )}
            {delta === 0 && <div className="date__result-delta">בדיוק כמו קודם 💫</div>}
          </motion.div>
        )}
      </div>

      <Button variant="ghost" block onClick={onRestart}>
        סיימנו — חזרה
      </Button>
    </div>
  );
}
