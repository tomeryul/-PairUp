import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
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
      <PageHeader eyebrow="הכול עליכם" title="הגדרות" />

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
            ההתקדמות שלכם נשמרת אוטומטית בענן ומסתנכרנת בין המכשירים. ☁️
          </p>
          <Button variant="ghost" block onClick={() => { play('tap'); void logout(); }}>
            התנתקות
          </Button>
        </section>
      )}

      <section className="settings__group glass">
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

      <section className="settings__group glass">
        <h3 className="settings__title">חוויה</h3>
        <Row
          label="מצב כהה"
          desc="עיצוב כהה ורומנטי"
          on={theme === 'dark'}
          onToggle={() => { play('tap'); toggleTheme(); }}
        />
        <Row
          label="אפקטים קוליים"
          desc="צלילים עדינים בלחיצות"
          on={soundEnabled}
          onToggle={() => { play('tap'); toggleSound(); }}
        />
        <Row
          label="מוזיקת רקע"
          desc="צליל אווירה רגוע"
          on={musicEnabled}
          onToggle={() => { play('tap'); toggleMusic(); }}
        />
      </section>

      {birthdayDiscovered && (
        <section className="settings__group glass settings__birthday">
          <h3 className="settings__title">🎁 מצב יום הולדת</h3>
          <p className="settings__hint">גיליתם את ההפתעה! אפשר לחזור אליה בכל רגע.</p>
          <Button block onClick={() => { play('sparkle'); navigate('/birthday'); }}>
            פתחו את ההפתעה ✨
          </Button>

          <div className="settings__letter">
            <label className="field">
              <span className="field__label">מכתב האהבה שלך 💌</span>
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
              {letterSaved ? '✓ המכתב נשמר' : 'שמירת המכתב'}
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

      <p className="settings__footer">
        PairUp · נבנה באהבה 💛
      </p>
    </div>
  );
}

function Row({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="settings__row">
      <div>
        <div className="settings__row-label">{label}</div>
        <div className="settings__row-desc">{desc}</div>
      </div>
      <button
        className={`toggle${on ? ' is-on' : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
      >
        <span className="toggle__knob" />
      </button>
    </div>
  );
}
