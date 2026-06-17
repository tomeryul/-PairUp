import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { HeartBurst } from '@/components/HeartBurst';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import { dayKey, daysBetween, formatDate, timeUntil } from '@/lib/date';
import './Capsules.css';

export function Capsules() {
  const capsules = useAppStore((s) => s.capsules);
  const names = useAppStore((s) => s.names);
  const addCapsule = useAppStore((s) => s.addCapsule);
  const openCapsule = useAppStore((s) => s.openCapsule);
  const removeCapsule = useAppStore((s) => s.removeCapsule);
  const play = useSound();

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [author, setAuthor] = useState<'a' | 'b'>('a');
  const [burst, setBurst] = useState(0);

  const canSave = title.trim() && message.trim() && openAt;

  const save = () => {
    if (!canSave) return;
    play('success');
    addCapsule({ title: title.trim(), message: message.trim(), openAt, author });
    setTitle('');
    setMessage('');
    setOpenAt('');
    setCreating(false);
  };

  const today = dayKey();

  return (
    <div className="page">
      {burst > 0 && <HeartBurst key={burst} count={22} />}
      <PageHeader
        eyebrow="מסרים לעתיד"
        title="קפסולות זמן"
        subtitle="כתבו מסר היום, ופתחו אותו ביום מיוחד בעתיד."
      />

      {!creating && (
        <Button block size="lg" onClick={() => { play('tap'); setCreating(true); }}>
          ✨ קפסולה חדשה
        </Button>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div
            className="capsule-form glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="field">
              <span className="field__label">כותרת</span>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: ליום הנישואין הראשון שלנו"
                maxLength={60}
              />
            </label>
            <label className="field">
              <span className="field__label">המסר שלכם</span>
              <textarea
                className="textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="כתבו משהו מהלב..."
              />
            </label>
            <label className="field">
              <span className="field__label">תיפתח בתאריך</span>
              <input
                className="input"
                type="date"
                value={openAt}
                min={today}
                onChange={(e) => setOpenAt(e.target.value)}
              />
            </label>
            <div className="field">
              <span className="field__label">מאת</span>
              <div className="capsule-author">
                {(['a', 'b'] as const).map((k) => (
                  <button
                    key={k}
                    className={`capsule-author__btn${author === k ? ' is-active' : ''}`}
                    onClick={() => setAuthor(k)}
                  >
                    {k === 'a' ? names.a : names.b}
                  </button>
                ))}
              </div>
            </div>
            <div className="capsule-form__actions">
              <Button variant="ghost" onClick={() => { play('tap'); setCreating(false); }}>
                ביטול
              </Button>
              <Button block onClick={save} disabled={!canSave}>
                נעל את הקפסולה 🔒
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="capsule-list">
        {capsules.length === 0 && !creating && (
          <div className="empty glass">
            <div className="empty__emoji">⏳</div>
            <h2 className="empty__title">אין עדיין קפסולות</h2>
            <p>צרו מסר ראשון שיחכה לכם בעתיד.</p>
          </div>
        )}

        {capsules.map((c) => {
          const ready = daysBetween(c.openAt, today) <= 0;
          const unlocked = ready && c.opened;
          return (
            <motion.div
              key={c.id}
              layout
              className={`capsule glass${ready ? ' is-ready' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="capsule__head">
                <span className="capsule__lock">{unlocked ? '💌' : ready ? '🔓' : '🔒'}</span>
                <div className="capsule__meta">
                  <h3 className="capsule__title">{c.title}</h3>
                  <span className="capsule__sub">
                    מאת {c.author === 'a' ? names.a : names.b} ·{' '}
                    {ready ? `נפתחה ${formatDate(c.openAt)}` : timeUntil(c.openAt)}
                  </span>
                </div>
                <button
                  className="capsule__del"
                  onClick={() => { play('tap'); removeCapsule(c.id); }}
                  aria-label="מחק"
                >
                  ✕
                </button>
              </div>

              {unlocked ? (
                <motion.p
                  className="capsule__message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {c.message}
                </motion.p>
              ) : ready ? (
                <Button
                  block
                  onClick={() => {
                    play('sparkle');
                    openCapsule(c.id);
                    setBurst((b) => b + 1);
                  }}
                >
                  פתחו את הקפסולה 💝
                </Button>
              ) : (
                <p className="capsule__teaser">
                  המסר נעול עד {formatDate(c.openAt)} · {timeUntil(c.openAt)}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
