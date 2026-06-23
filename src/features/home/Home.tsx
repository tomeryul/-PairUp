import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';
import { useSound } from '@/hooks/useSound';
import { Icon, type IconName } from '@/components/ui/Icon';
import { birthdayDate, birthdayGreeting } from '@/data/birthday';
import { daysUntilDate, isDateToday } from '@/lib/date';
import './Home.css';

const greetingForHour = () => {
  const h = new Date().getHours();
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
};

interface Feature {
  to: string;
  icon: IconName;
  grad: string;
  title: string;
  sub: string;
}

const features: Feature[] = [
  { to: '/categories', icon: 'chat', grad: '#ef7fa3', title: 'שאלות', sub: 'בחרו קטגוריה' },
  { to: '/quiz', icon: 'target', grad: '#c479a0', title: 'חידון היכרות', sub: 'נחשו תשובות' },
  { to: '/surprise', icon: 'gift', grad: '#f3b6a0', title: 'הפתעה', sub: 'אתגר רומנטי' },
  { to: '/journey', icon: 'heart', grad: '#d85f86', title: 'המסע שלנו', sub: 'זכרונות' },
  { to: '/capsules', icon: 'clock', grad: '#b98ac4', title: 'קפסולות זמן', sub: 'מסר לעתיד' },
  { to: '/achievements', icon: 'trophy', grad: '#e8b84b', title: 'הישגים', sub: 'מה השגנו' },
];

export function Home() {
  const names = useAppStore((s) => s.names);
  const streak = useAppStore((s) => s.streak);
  const answered = useAppStore((s) => s.answeredCount);
  const discoverBirthday = useAppStore((s) => s.discoverBirthday);
  const daily = useDailyQuestion();
  const navigate = useNavigate();
  const play = useSound();
  const [taps, setTaps] = useState(0);

  const onSecretTap = () => {
    play('sparkle');
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) {
      discoverBirthday();
      navigate('/birthday');
    }
  };

  const isBday = isDateToday(birthdayDate.day, birthdayDate.month);
  const daysToBday = daysUntilDate(birthdayDate.day, birthdayDate.month);

  // On the birthday itself, open the surprise automatically — once per device
  // per year, so it doesn't reopen every time they return to Home.
  useEffect(() => {
    if (!isBday) return;
    const key = `pairup-bday-opened-${new Date().getFullYear()}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    discoverBirthday();
    navigate('/birthday');
  }, [isBday, discoverBirthday, navigate]);

  return (
    <div className="page home">
      <div className="home__bar">
        <span className="home__wordmark">PairUp</span>
        <button className="home__secret" onClick={onSecretTap} aria-label="לב">
          <motion.span
            style={{ display: 'grid', placeItems: 'center' }}
            animate={{ scale: [1, 1.16, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon name="heart" size={20} />
          </motion.span>
        </button>
      </div>

      <p className="home__greeting">{greetingForHour()},</p>
      <h1 className="home__names">
        {names.a} <span className="home__amp">&amp;</span> {names.b}
      </h1>

      {isBday && (
        <button
          className="home__bday"
          onClick={() => {
            play('sparkle');
            discoverBirthday();
            navigate('/birthday');
          }}
        >
          <span className="home__bday-eyebrow">היום חוגגים</span>
          <h2 className="home__bday-title">
            יום הולדת שמח, {birthdayGreeting.name}!
          </h2>
          <p className="home__bday-sub">הכנו לך משהו קטן וקסום — לחצי כדי לפתוח</p>
          <span className="home__bday-cta">
            פתחו את ההפתעה <Icon name="gift" size={18} />
          </span>
        </button>
      )}

      {!isBday && daysToBday <= 14 && (
        <div className="home__bday-soon">
          <span className="badge badge--soft badge--md">
            <Icon name="gift" />
          </span>
          <span className="home__bday-soon-txt">
            עוד {daysToBday === 1 ? 'יום אחד' : `${daysToBday} ימים`} ליום ההולדת
            של {birthdayGreeting.name} ✨
          </span>
        </div>
      )}

      <div className="home__stats">
        <div className="chip">
          <Icon name="flame" /> רצף {streak} ימים
        </div>
        <div className="chip">
          <Icon name="chat" /> {answered} שאלות
        </div>
      </div>

      <Link to="/date" className="home__date" onClick={() => play('sparkle')}>
        <div className="home__date-glow" />
        <div className="home__date-content">
          <span className="home__date-eyebrow">החוויה המלאה</span>
          <h2 className="home__date-title">התחילו דייט</h2>
          <p className="home__date-sub">שאלות, אתגרים וציון התאמה בסוף</p>
        </div>
        <span className="home__date-arrow">
          <Icon name="arrowL" size={26} />
        </span>
      </Link>

      <Link to="/daily" className="home__daily glass" onClick={() => play('tap')}>
        <span className="chip home__daily-chip">
          <Icon name="heart" /> השאלה היומית
        </span>
        <p className="home__daily-q">{daily.text}</p>
        <span className="home__daily-cta">
          פתחו את היום שלכם <Icon name="arrowL" size={15} />
        </span>
      </Link>

      <div className="home__section-label">
        <span>גלו עוד</span>
      </div>

      <div className="home__grid">
        {features.map((f, i) => (
          <motion.div
            key={f.to}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={f.to} className="home__tile glass" onClick={() => play('tap')}>
              <span className="badge badge--md" style={{ background: f.grad }}>
                <Icon name={f.icon} />
              </span>
              <span className="home__tile-text">
                <span className="home__tile-title">{f.title}</span>
                <span className="home__tile-sub">{f.sub}</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
