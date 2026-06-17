import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, firebaseEnabled, googleProvider, isEmailAllowed } from '@/lib/firebase';
import { startCloudSync, stopCloudSync } from '@/lib/cloudSync';

export type AuthStatus =
  | 'loading'
  | 'unconfigured'
  | 'signed-out'
  | 'denied'
  | 'signed-in';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  error: string | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Map a Firebase auth error code to a clear Hebrew message. */
function messageFor(code: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'הדומיין הזה לא מאושר ב-Firebase. יש להוסיף את tomeryul.github.io תחת Authentication ← Settings ← Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'התחברות Google אינה מופעלת ב-Firebase (Authentication ← Sign-in method).';
    case 'auth/network-request-failed':
      return 'בעיית רשת. בדקו את החיבור לאינטרנט ונסו שוב.';
    case 'auth/popup-blocked':
      return 'הדפדפן חסם את חלון ההתחברות. מנסה בדרך אחרת...';
    default:
      return `ההתחברות נכשלה${code ? ` (${code})` : ''}. נסו שוב.`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    firebaseEnabled ? 'loading' : 'unconfigured',
  );
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dev-only bypass for local UI testing without Google sign-in.
    // Inert in production builds (import.meta.env.DEV is false there).
    if (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === '1') {
      setUser({ uid: 'dev', email: 'dev@pairup.local', displayName: 'Dev' } as User);
      setStatus('signed-in');
      return;
    }
    if (!firebaseEnabled || !auth) return;
    const a = auth;

    // Complete any redirect-based sign-in and surface its errors.
    getRedirectResult(a).catch((err: { code?: string }) => {
      setError(messageFor(err.code ?? ''));
    });

    const unsub = onAuthStateChanged(a, async (u) => {
      if (!u) {
        stopCloudSync();
        setUser(null);
        setStatus('signed-out');
        return;
      }
      if (!isEmailAllowed(u.email)) {
        setError('המשתמש הזה לא מורשה להיכנס לאפליקציה.');
        setStatus('denied');
        await signOut(a);
        return;
      }
      setUser(u);
      setError(null);
      await startCloudSync(u.uid);
      setStatus('signed-in');
    });
    return unsub;
  }, []);

  const signIn = async () => {
    if (!auth) return;
    setError(null);

    // Popup is the most reliable method when the app's domain differs from
    // Firebase's auth domain (e.g. github.io vs firebaseapp.com): the result
    // returns to the same page via postMessage, so it isn't lost to mobile
    // browser storage partitioning the way signInWithRedirect is.
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return; // user dismissed
      }
      if (code === 'auth/popup-blocked') {
        // Last resort on browsers that block popups outright.
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (err2: unknown) {
          setError(messageFor((err2 as { code?: string }).code ?? ''));
          return;
        }
      }
      setError(messageFor(code));
      console.error('[auth] signIn failed', err);
    }
  };

  const logout = async () => {
    if (!auth) return;
    stopCloudSync();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ status, user, error, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
