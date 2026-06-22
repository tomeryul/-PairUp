import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/auth/AuthProvider';
import { useSound } from '@/hooks/useSound';
import './Settings.css';

export function Settings() {
  const {
    names,
    theme,
    soundEnabled,
    musicEnabled,
    birthdayDiscovered,
    birthdayLetter,
    streak,
    answeredCount,
    bestQuizScore,
    setNames,
    toggleTheme,
    toggleSound,
    toggleMusic,
    setBirthdayLetter,
    resetAll,
  } = useAppStore();
  const { user, logout } = useAuth();
  const play = useSound();
  const navigate = useNavigate();
  const [a, setA] = useState(names.a);
  const [b, setB] = useState(names.b);
  const [confirmReset, setConfirmReset] = useState(false);
  const [letterDraft, setLetterDraft] = useState(birthdayLetter);
  const [letterSaved, setLetterSaved] = useState(false);

  const saveLetter = () => {
    play('success');
    setBirthdayLetter(letterDraft);
    setLetterSaved(true);
    setTimeout(() => setLetterSaved(false), 2000);
  };

  const saveNames = () => {
    play('success');
    setNames({ a: a.trim() || names.a, b: b.trim() || names.b });
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="ההעדפות שלנו"
        title="עוד"
        subtitle="התאמות אישיות, הישגים והפתעות."
      />

      {user && (
        <section className="settings__group glass">
          <h3 className="settings__title">החשבון שלך</h3>
          <div className="settings__account">
            {user.photoURL ? (
              <img className="settings__avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <div className="settings__avatar settings__avatar--ph">
                {(user.displayName ?? user.email ?? '?').charAt(0)}
              </div>
            )}
            <div className="settings__account-meta">
              <div className="settings__account-name">
                {user.displayName ?? 'מחובר/ת'}
              </div>
              <div className="settings__account-email">{user.email}</div>
            </div>
          </div>
          <p className="settings__hint">
            ההתקדמות שלכם נשמרת אוטומטית בענן ומסתנכרנת בין המכשירים.
          </p>
          <Button variant="ghost" block onClick={() => { play('tap'); void logout(); }}>
            התנתקות
          </Button>
        </section>
      )}

      <div className="settings__list">
        <SetToggle icon="moon" title="מצב כהה" sub="עיצוב לילי רך לעיניים" on={theme === 'dark'} onToggle={() => { play('tap'); toggleTheme(); }} />
        <SetToggle icon="spark" title="צלילים" sub="אפקטים קוליים עדינים" on={soundEnabled} onToggle={() => { play('tap'); toggleSound(); }} />
        <SetToggle icon="heart" title="מוזיקת רקע" sub="אווירה מרגיעה" on={musicEnabled} onToggle={() => { play('tap'); toggleMusic(); }} />
        <SetStat icon="flame" title="רצף שיחות" val={`${streak} ימים`} />
        <SetStat icon="chat" title="שאלות שענינו" val={`${answeredCount}`} />
        <SetStat icon="target" title="שיא תאימות" val={`${bestQuizScore || 0}%`} />
      </div>

      <section className="settings__group glass" style={{ marginTop: 'var(--s-4)' }}>
        <h3 className="settings__title">השמות שלכם</h3>
        <label className="field">
          <span className="field__label">שם ראשון</span>
          <input className="input" value={a} onChange={(e) => setA(e.target.value)} maxLength={20} />
        </label>
        <label className="field">
          <span className="field__label">שם שני</span>
          <input className="input" value={b} onChange={(e) => setB(e.target.value)} maxLength={20} />
        </label>
        <Button block onClick={saveNames}>שמירה</Button>
      </section>

      {birthdayDiscovered && (
        <section className="settings__group glass settings__birthday">
          <div className="settings__bday-head">
            <span className="badge badge--soft badge--md" style={{ color: 'var(--brand-gold)' }}>
              <Icon name="gift" />
            </span>
            <div>
              <h3 className="settings__title" style={{ marginBottom: 2 }}>מצב יום הולדת</h3>
              <p className="settings__hint" style={{ margin: 0 }}>החוויה המיוחדת של {names.b}</p>
            </div>
          </div>
          <Button block onClick={() => { play('sparkle'); navigate('/birthday'); }}>
            פתחו את ההפתעה
          </Button>

          <div className="settings__letter">
            <label className="field">
              <span className="field__label">מכתב האהבה שלך</span>
              <textarea
                className="textarea"
                rows={8}
                value={letterDraft}
                onChange={(e) => setLetterDraft(e.target.value)}
                placeholder="כתוב כאן את המכתב שלך... הוא יופיע במצב יום ההולדת. אפשר להשאיר שורה ריקה בין פסקאות."
              />
            </label>
            <p className="settings__hint">
              המכתב נשמר באופן פרטי ומסתנכרן בין המכשירים. אם תשאיר ריק — יוצג מכתב ברירת מחדל.
            </p>
            <Button block onClick={saveLetter} disabled={letterDraft === birthdayLetter}>
              {letterSaved ? 'המכתב נשמר ✓' : 'שמירת המכתב'}
            </Button>
          </div>
        </section>
      )}

      <section className="settings__group glass">
        <h3 className="settings__title">איפוס</h3>
        <p className="settings__hint">מחיקת כל הזכרונות, הקפסולות וההתקדמות. אי אפשר לשחזר.</p>
        {!confirmReset ? (
          <Button variant="ghost" block onClick={() => setConfirmReset(true)}>
            איפוס הנתונים
          </Button>
        ) : (
          <div className="settings__confirm">
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>ביטול</Button>
            <Button
              block
              onClick={() => { play('pop'); resetAll(); setConfirmReset(false); }}
            >
              כן, אפס הכול
            </Button>
          </div>
        )}
      </section>

      <p className="settings__footer">PairUp · נבנה באהבה</p>
    </div>
  );
}

function SetToggle({
  icon,
  title,
  sub,
  on,
  onToggle,
}: {
  icon: IconName;
  title: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="set-row glass">
      <span className="set-row__label">
        <span className="badge badge--soft badge--md">
          <Icon name={icon} />
        </span>
        <span className="set-row__txt">
          <span className="set-row__title">{title}</span>
          <span className="set-row__sub">{sub}</span>
        </span>
      </span>
      <button
        className={`toggle${on ? ' is-on' : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={title}
      >
        <span className="toggle__knob" />
      </button>
    </div>
  );
}

function SetStat({ icon, title, val }: { icon: IconName; title: string; val: string }) {
  return (
    <div className="set-row glass">
      <span className="set-row__label">
        <span className="badge badge--soft badge--md">
          <Icon name={icon} />
        </span>
        <span className="set-row__txt">
          <span className="set-row__title">{title}</span>
        </span>
      </span>
      <span className="set-row__val">{val}</span>
    </div>
  );
}
