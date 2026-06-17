import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase web config. These values are NOT secret — the Firebase web config
 * is designed to ship to the browser. Access is controlled by the email
 * allow-list + Firestore security rules, not by hiding these values.
 *
 * Values come from Vite env vars when provided (see .env.example), and
 * otherwise fall back to the committed PairUp project config so the app
 * works out-of-the-box on any host without extra build secrets.
 */
const env = import.meta.env;
const config = {
  apiKey: (env.VITE_FIREBASE_API_KEY as string) || 'AIzaSyDgjO95rgDXq9HBofCenr3loQJ6VFBwIZI',
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'pairup-1f14f.firebaseapp.com',
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string) || 'pairup-1f14f',
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'pairup-1f14f.firebasestorage.app',
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '195437862486',
  appId: (env.VITE_FIREBASE_APP_ID as string) || '1:195437862486:web:391047575aa9b67273a5f7',
};

/** True when essential config is present (always true with the baked-in
 *  fallback) so the app can show a friendly "not configured" screen otherwise. */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

export const app: FirebaseApp | null = firebaseEnabled
  ? initializeApp(config as Record<string, string>)
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Allow-list of Google emails permitted to sign in ("only existing users").
 * Anyone signing in with an email not on this list is rejected automatically.
 *
 * 👉 ערכו את הרשימה כאן והוסיפו את האימייל של בן/בת הזוג.
 *    (אפשר גם לדרוס דרך משתנה הסביבה VITE_ALLOWED_EMAILS.)
 */
const DEFAULT_ALLOWED_EMAILS = [
  'tomer.yul@gmail.com',
  // 'partner@gmail.com',
];

export const allowedEmails = (
  (import.meta.env.VITE_ALLOWED_EMAILS as string | undefined) ??
  DEFAULT_ALLOWED_EMAILS.join(',')
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** An empty allow-list means "no restriction" (any signed-in Google user). */
export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  if (allowedEmails.length === 0) return true;
  return allowedEmails.includes(email.toLowerCase());
};
