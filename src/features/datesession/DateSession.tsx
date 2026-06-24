import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { HeartBurst } from '@/components/HeartBurst';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import { questions } from '@/data/questions';
import { dares, type Dare } from '@/data/dares';
import { buildGptPrompt } from '@/lib/gptPrompt';
import { fileToThumbnail } from '@/lib/image';
import { dayKey, formatDate } from '@/lib/date';
import type { SessionMoment, SessionQA } from '@/types';
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

const OTHER_CATS = ['deep', 'love', 'future', 'dreams', 'childhood', 'datenight'];

const LENGTHS = [
  { n: 10, label: 'קצר' },
  { n: 16, label: 'בינוני' },
  { n: 24, label: 'ארוך' },
];

function buildPlan(total: number): Round[] {
  const numDares = Math.max(2, Math.round(total / 3));
  const numQ = total - numDares;

  const aboutus = shuffle(questions.filter((q) => q.category === 'aboutus'));
  const others = shuffle(questions.filter((q) => OTHER_CATS.includes(q.category)));

  // Personal "our journey" questions are the heart of a session — prioritise them.
  const numAbout = Math.min(aboutus.length, Math.ceil(numQ * 0.7));
  const picked = [
    ...aboutus.slice(0, numAbout),
    ...others.slice(0, Math.max(0, numQ - numAbout)),
  ];
  const qs: Round[] = shuffle(picked).map((q) => ({ kind: 'question', text: q.text }));

  const ds: Round[] = shuffle(dares)
    .slice(0, numDares)
    .map((d) => ({ kind: 'dare', dare: d }));

  // Interleave the dares evenly between the questions.
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
  const updateSession = useAppStore((s) => s.updateSession);
  const incrementAnswered = useAppStore((s) => s.incrementAnswered);
  const play = useSound();

  const [phase, setPhase] = useState<Phase>('intro');
  const [length, setLength] = useState(16);
  const [dateOf, setDateOf] = useState<string>(dayKey());
  const [occasion, setOccasion] = useState('');
  const [plan, setPlan] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [qsub, setQsub] = useState<QSub>('a');
  const [answerA, setAnswerA] = useState('');
  const [answerB, setAnswerB] = useState('');
  const [qa, setQa] = useState<SessionQA[]>([]);
  const [daresDone, setDaresDone] = useState(0);
  const [moments, setMoments] = useState<SessionMoment[]>([]);
  const [capturing, setCapturing] = useState(false);
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
    setMoments([]);
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

  const addMoment = (m: SessionMoment) => setMoments((prev) => [...prev, m]);

  const round = plan[idx];

  return (
    <div className="page date">
      {burst > 0 && <HeartBurst key={burst} count={26} />}

      {phase === 'intro' && (
        <IntroView
          names={names}
          length={length}
          setLength={setLength}
          dateOf={dateOf}
          setDateOf={setDateOf}
          occasion={occasion}
          setOccasion={setOccasion}
          onStart={start}
          sessions={sessions}
        />
      )}

      {phase === 'play' && round && (
        <div className="date__play">
          <div className="date__progress-row">
            <span className="chip">סבב {idx + 1} / {plan.length}</span>
            <div className="date__bar">
              <div
                className="date__bar-fill"
                style={{ width: `${((idx + 1) / plan.length) * 100}%` }}
              />
            </div>
            <button
              className="date__capture-btn"
              onClick={() => {
                play('tap');
                setCapturing(true);
              }}
            >
              <Icon name="camera" size={16} /> רגע
            </button>
          </div>

          {moments.length > 0 && (
            <div className="date__moment-hint chip">
              <Icon name="heart" /> תיעדתם {moments.length} רגעים בדייט הזה
            </div>
          )}

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
                <span className="chip date__kind"><Icon name="chat" /> שאלה</span>
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
                      {qsub === 'a' ? (
                        <>תורו של {names.b} <Icon name="arrowL" size={18} /></>
                      ) : (
                        'גלו תשובות'
                      )}
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
                      {idx + 1 >= plan.length ? (
                        'לסיכום'
                      ) : (
                        <>הסבב הבא <Icon name="arrowL" size={18} /></>
                      )}
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
                  <Icon name="flame" /> אתגר · {round.dare.type}
                </span>
                <span className="badge date__dare-emoji" style={{ background: 'var(--grad-sunset)' }}>
                  <Icon name="flame" />
                </span>
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
                      setDaresDone((n) => Math.min(daresTotal, n + 1));
                      setBurst((b) => b + 1);
                      advance();
                    }}
                  >
                    <Icon name="check" size={18} /> ביצענו!
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
          dateOf={dateOf}
          occasion={occasion}
          moments={moments}
          onCapture={() => {
            play('tap');
            setCapturing(true);
          }}
          addSession={addSession}
          updateSession={updateSession}
          previousBest={sessions.find((s) => s.gptScore != null)?.gptScore ?? null}
          onRestart={() => {
            play('tap');
            setPhase('intro');
          }}
        />
      )}

      <AnimatePresence>
        {capturing && (
          <CaptureSheet
            onClose={() => setCapturing(false)}
            onSave={(m) => {
              addMoment(m);
              setCapturing(false);
              setBurst((b) => b + 1);
              play('success');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Capture sheet (a "moment") ---------------- */
function CaptureSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (m: SessionMoment) => void;
}) {
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setPhoto(await fileToThumbnail(file));
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="date__sheet-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="date__sheet glass"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="date__sheet-grip" />
        <h3 className="date__sheet-title">רגע לתיעוד</h3>
        <p className="date__sheet-text">
          אוכלים? קורה משהו חמוד? שמרו אותו עכשיו והמשיכו בשאלון.
        </p>
        <textarea
          className="textarea"
          rows={2}
          placeholder="מה אכלנו / מה קרה עכשיו..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {photo ? (
          <img className="date__meal-photo" src={photo} alt="" />
        ) : (
          <label className="date__meal-add">
            <Icon name="camera" size={18} /> {busy ? 'טוען תמונה...' : 'הוסיפו תמונה'}
            <input type="file" accept="image/*" hidden onChange={onPhoto} />
          </label>
        )}
        <div className="date__sheet-actions">
          <Button variant="ghost" onClick={onClose}>
            סגירה
          </Button>
          <Button
            block
            disabled={!note.trim() && !photo}
            onClick={() =>
              onSave({
                note: note.trim() || undefined,
                photo: photo || undefined,
                createdAt: Date.now(),
              })
            }
          >
            שמרו רגע
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Intro ---------------- */
function IntroView({
  names,
  length,
  setLength,
  dateOf,
  setDateOf,
  occasion,
  setOccasion,
  onStart,
  sessions,
}: {
  names: { a: string; b: string };
  length: number;
  setLength: (n: number) => void;
  dateOf: string;
  setDateOf: (s: string) => void;
  occasion: string;
  setOccasion: (s: string) => void;
  onStart: () => void;
  sessions: ReturnType<typeof useAppStore.getState>['sessions'];
}) {
  const scored = sessions.filter((s) => s.gptScore != null);
  return (
    <>
      <PageHeader
        eyebrow="הופכים כל יציאה לחוויה"
        title="דייט"
        subtitle="סשן שמלווה אתכם לאורך כל הדייט — שאלות אישיות, אתגרים, ותיעוד רגעים תוך כדי."
      />

      <div className="date__intro glass">
        <div className="date__intro-emoji">
          <Icon name="spark" />
        </div>
        <p className="date__intro-text">
          {names.a} ו{names.b}, מוכנים? בחרו אורך סשן והתחילו.
        </p>

        <div className="date__fields">
          <label className="field date__field">
            <span className="field__label">תאריך הדייט</span>
            <input
              className="input"
              type="date"
              value={dateOf}
              onChange={(e) => setDateOf(e.target.value)}
            />
          </label>
          <label className="field date__field">
            <span className="field__label">לכבוד מה? (לא חובה)</span>
            <input
              className="input"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="יום שנה, סתם ערב טוב..."
              maxLength={50}
            />
          </label>
        </div>

        <div className="date__lengths">
          {LENGTHS.map((o) => (
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
          בואו נתחיל
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
            {sessions.slice(0, 6).map((s) => {
              const photo = s.moments?.find((m) => m.photo)?.photo;
              const note = s.moments?.find((m) => m.note)?.note;
              return (
                <div key={s.id} className="date__history-row glass">
                  {photo && <img className="date__history-photo" src={photo} alt="" />}
                  <div className="date__history-info">
                    <span className="date__history-date">
                      {formatDate(s.date ?? s.createdAt)}
                      {s.occasion ? ` · ${s.occasion}` : ''}
                    </span>
                    {(note || (s.moments && s.moments.length > 0)) && (
                      <span className="date__history-meal">
                        <Icon name="camera" size={13} /> {note || `${s.moments?.length} רגעים`}
                      </span>
                    )}
                  </div>
                  <span className="date__history-meta">
                    <Icon name="flame" size={14} /> {s.daresDone}/{s.daresTotal}
                    {s.gptScore != null && (
                      <>
                        {' · '}
                        <Icon name="heart" size={14} /> {s.gptScore}
                      </>
                    )}
                  </span>
                </div>
              );
            })}
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
  dateOf,
  occasion,
  moments,
  onCapture,
  addSession,
  updateSession,
  previousBest,
  onRestart,
}: {
  names: { a: string; b: string };
  qa: SessionQA[];
  daresDone: number;
  daresTotal: number;
  dateOf: string;
  occasion: string;
  moments: SessionMoment[];
  onCapture: () => void;
  addSession: ReturnType<typeof useAppStore.getState>['addSession'];
  updateSession: ReturnType<typeof useAppStore.getState>['updateSession'];
  previousBest: number | null;
  onRestart: () => void;
}) {
  const play = useSound();
  const sessionIdRef = useRef<string | null>(null);
  const prevScoreRef = useRef<number | null>(previousBest);
  const [score, setScore] = useState('');
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-save the session once when the summary opens.
  useEffect(() => {
    if (sessionIdRef.current) return;
    sessionIdRef.current = addSession({
      daresDone,
      daresTotal,
      qa,
      gptScore: null,
      date: dateOf,
      occasion: occasion.trim() || undefined,
      moments,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep moments captured on the summary screen in sync with the saved record.
  useEffect(() => {
    if (sessionIdRef.current) updateSession(sessionIdRef.current, { moments });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moments]);

  const prompt = useMemo(() => buildGptPrompt(names, qa), [names, qa]);

  const openGpt = async () => {
    play('sparkle');
    // Copy the full prompt and open ChatGPT plainly. Passing the whole prompt
    // in the URL (?q=) overflows the length limit and returns HTTP 400, so the
    // questions/answers never arrive — the user just pastes them instead.
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
    window.open('https://chatgpt.com/', '_blank', 'noopener');
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
    updateSession(sessionIdRef.current, { gptScore: n });
    setSavedScore(n);
  };

  const prevScore = prevScoreRef.current;
  const delta =
    savedScore != null && prevScore != null ? savedScore - prevScore : null;

  return (
    <div className="date__summary">
      <PageHeader
        eyebrow={occasion.trim() ? `לכבוד ${occasion.trim()}` : 'כל הכבוד'}
        title="סיכום הדייט"
      />

      <div className="date__stats glass">
        <div className="date__stat">
          <span className="date__stat-num">{daresDone}/{daresTotal}</span>
          <span className="date__stat-label">אתגרים</span>
        </div>
        <div className="date__stat">
          <span className="date__stat-num">{qa.length}</span>
          <span className="date__stat-label">שאלות</span>
        </div>
        <div className="date__stat">
          <span className="date__stat-num">{moments.length}</span>
          <span className="date__stat-label">רגעים</span>
        </div>
      </div>

      <div className="date__gpt glass">
        <h3 className="date__gpt-title">ציון ההתאמה</h3>
        <p className="date__gpt-text">
          נעתיק לכם את הפרומפט המלא (כל השאלות והתשובות שלכם) ונפתח את ChatGPT —
          רק הדביקו אותו בצ׳אט (Paste) ושלחו. קבלו ציון התאמה והזינו אותו כאן כדי
          לעקוב אם השתפרתם.
        </p>
        <Button block size="lg" onClick={openGpt}>
          {copied ? 'הפרומפט הועתק — הדביקו ב-ChatGPT ✓' : 'נתחו את ההתאמה ב-ChatGPT'}
        </Button>
        <Button variant="ghost" block onClick={copyPrompt}>
          {copied ? 'הפרומפט הועתק ✓' : 'העתיקו את הפרומפט'}
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
                {delta > 0 ? `השתפרתם ב-${delta} נקודות!` : `${delta} מהפעם הקודמת`}
              </div>
            )}
            {delta === 0 && <div className="date__result-delta">בדיוק כמו קודם</div>}
          </motion.div>
        )}
      </div>

      <div className="date__moments glass">
        <div className="date__moments-head">
          <h3 className="date__gpt-title">רגעים מהדייט</h3>
          <button className="date__capture-btn" onClick={onCapture}>
            <Icon name="plus" size={15} /> הוספה
          </button>
        </div>
        {moments.length === 0 ? (
          <p className="date__gpt-text">עוד לא תיעדתם רגעים. אפשר להוסיף עכשיו.</p>
        ) : (
          <div className="date__moments-grid">
            {moments.map((m, i) => (
              <div key={i} className="date__moment">
                {m.photo && <img className="date__moment-photo" src={m.photo} alt="" />}
                {m.note && <span className="date__moment-note">{m.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="ghost" block onClick={onRestart}>
        סיימנו — חזרה
      </Button>
    </div>
  );
}
