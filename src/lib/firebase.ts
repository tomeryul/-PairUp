import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase is configured entirely through Vite env vars (see .env.example).
 * Nothing here is secret — the Firebase web config is meant to ship to the
 * client. Access is controlled by the email allow-list + Firestore rules.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** True only when the essential config is present, so the app can show a
 *  friendly "not configured yet" screen instead of crashing. */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

export const app: FirebaseApp | null = firebaseEnabled
  ? initializeApp(config as Record<string, string>)
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Comma-separated allow-list of emails permitted to sign in. */
export const allowedEmails = (
  (import.meta.env.VITE_ALLOWED_EMAILS as string | undefined) ?? ''
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
