import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/auth/AuthProvider';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BottomNav } from '@/components/BottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MusicController } from '@/components/MusicController';
import { Login } from '@/features/auth/Login';
import {
  AuthLoading,
  AuthDenied,
  AuthUnconfigured,
} from '@/features/auth/AuthScreens';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { Home } from '@/features/home/Home';
import { DateSession } from '@/features/datesession/DateSession';
import { Categories } from '@/features/categories/Categories';
import { PlaySession } from '@/features/play/PlaySession';
import { Journey } from '@/features/journey/Journey';
import { Capsules } from '@/features/capsules/Capsules';
import { Quiz } from '@/features/quiz/Quiz';
import { Surprise } from '@/features/surprise/Surprise';
import { Achievements } from '@/features/achievements/Achievements';
import { Daily } from '@/features/daily/Daily';
import { Settings } from '@/features/settings/Settings';
import { Birthday } from '@/features/birthday/Birthday';
import './components/ui/ui.css';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

export default function App() {
  useTheme();
  const { status } = useAuth();

  return (
    <>
      <AnimatedBackground />
      {status === 'unconfigured' && <AuthUnconfigured />}
      {status === 'loading' && <AuthLoading />}
      {status === 'signed-out' && <Login />}
      {status === 'denied' && <AuthDenied />}
      {status === 'signed-in' && <MainApp />}
    </>
  );
}

function MainApp() {
  const onboarded = useAppStore((s) => s.onboarded);
  const touchStreak = useAppStore((s) => s.touchStreak);
  const location = useLocation();

  useEffect(() => {
    if (onboarded) touchStreak();
  }, [onboarded, touchStreak]);

  if (!onboarded) {
    return <Onboarding />;
  }

  const isBirthday = location.pathname === '/birthday';

  return (
    <>
      <MusicController />
      <main className="app-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ErrorBoundary resetKey={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/date" element={<DateSession />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/play/:categoryId" element={<PlaySession />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/capsules" element={<Capsules />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/surprise" element={<Surprise />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/birthday" element={<Birthday />} />
              <Route path="*" element={<Home />} />
            </Routes>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isBirthday && <BottomNav />}
    </>
  );
}
