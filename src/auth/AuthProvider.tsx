import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    firebaseEnabled ? 'loading' : 'unconfigured',
  );
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseEnabled || !auth) return;
    const a = auth;
    const unsub = onAuthStateChanged(a, async (u) => {
      if (!u) {
        stopCloudSync();
        setUser(null);
        setStatus('signed-out');
        return;
      }
      if (!isEmailAllowed(u.email)) {
        // Not on the allow-list — reject and sign out.
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return; // user dismissed — not an error worth showing
      }
      setError('ההתחברות נכשלה. נסו שוב.');
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
