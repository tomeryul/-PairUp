import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';
import { useSound } from '@/hooks/useSound';
import { categoryMap } from '@/data/categories';
import './Home.css';

const greetingForHour = () => {
  const h = new Date().getHours();
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
};

const features = [
  { to: '/categories', emoji: '💬', title: 'שאלות', sub: 'בחרו קטגוריה' },
  { to: '/quiz', emoji: '🧠', title: 'חידון היכרות', sub: 'נחשו תשובות' },
  { to: '/surprise', emoji: '🎲', title: 'הפתעה', sub: 'אתגר רומנטי' },
  { to: '/journey', emoji: '💝', title: 'המסע שלנו', sub: 'זכרונות' },
  { to: '/capsules', emoji: '⏳', title: 'קפסולות זמן', sub: 'מסר לעתיד' },
  { to: '/achievements', emoji: '🏆', title: 'הישגים', sub: 'מה השגנו' },
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

  const dailyCat = categoryMap[daily.category];

  return (
    <div className="page home">
      <header className="home__top">
        <div>
          <p className="home__greeting">{greetingForHour()},</p>
          <h1 className="home__names">
            {names.a} <span className="home__amp">&amp;</span> {names.b}
          </h1>
        </div>
        <button
          className="home__secret"
          onClick={onSecretTap}
          aria-label="לב"
          title="❤"
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            ❤️
          </motion.span>
        </button>
      </header>

      <div className="home__stats">
        <div className="chip">🔥 רצף {streak} ימים</div>
        <div className="chip">💬 {answered} שאלות</div>
      </div>

      <Link to="/date" className="home__date" onClick={() => play('sparkle')}>
        <div className="home__date-glow" />
        <div className="home__date-content">
          <span className="home__date-eyebrow">החוויה המלאה</span>
          <h2 className="home__date-title">התחילו דייט 🔥</h2>
          <p className="home__date-sub">שאלות, אתגרים וציון התאמה בסוף</p>
        </div>
        <span className="home__date-arrow">←</span>
      </Link>

      <Link to="/daily" className="home__daily glass" onClick={() => play('tap')}>
        <div className="home__daily-head">
          <span className="chip home__daily-chip">
            {dailyCat?.emoji} השאלה היומית
          </span>
        </div>
        <p className="home__daily-q">{daily.text}</p>
        <span className="home__daily-cta">פתחו את היום שלכם ←</span>
      </Link>

      <div className="home__grid">
        {features.map((f, i) => (
          <motion.div
            key={f.to}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={f.to}
              className="home__tile glass"
              onClick={() => play('tap')}
            >
              <span className="home__tile-emoji">{f.emoji}</span>
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
