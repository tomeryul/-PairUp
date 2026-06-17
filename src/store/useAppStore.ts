import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Capsule,
  ProgressSnapshot,
  SavedItem,
  ThemeMode,
} from '@/types';
import { dayKey, daysBetween } from '@/lib/date';

interface AppState {
  /* onboarding & identity */
  onboarded: boolean;
  names: { a: string; b: string };

  /* preferences */
  theme: ThemeMode;
  soundEnabled: boolean;
  musicEnabled: boolean;

  /* couple journey */
  saved: SavedItem[];
  capsules: Capsule[];

  /* progress */
  answeredCount: number;
  quizPlays: number;
  bestQuizScore: number;
  streak: number;
  lastActiveDay: string | null;

  /* birthday */
  birthdayDiscovered: boolean;

  /* actions */
  completeOnboarding: (names: { a: string; b: string }) => void;
  setNames: (names: { a: string; b: string }) => void;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
  toggleSound: () => void;
  toggleMusic: () => void;

  addSaved: (item: Omit<SavedItem, 'id' | 'createdAt'>) => void;
  removeSaved: (id: string) => void;

  addCapsule: (c: Omit<Capsule, 'id' | 'createdAt' | 'opened'>) => void;
  openCapsule: (id: string) => void;
  removeCapsule: (id: string) => void;

  incrementAnswered: (by?: number) => void;
  recordQuiz: (scorePercent: number) => void;
  touchStreak: () => void;
  discoverBirthday: () => void;

  snapshot: () => ProgressSnapshot;
  resetAll: () => void;

  /** Replace the persistable slice with data loaded from the cloud. */
  applyCloudState: (data: Partial<CloudState>) => void;
}

/** The subset of state that is persisted (locally and to Firestore). */
export interface CloudState {
  onboarded: boolean;
  names: { a: string; b: string };
  theme: ThemeMode;
  soundEnabled: boolean;
  musicEnabled: boolean;
  saved: SavedItem[];
  capsules: Capsule[];
  answeredCount: number;
  quizPlays: number;
  bestQuizScore: number;
  streak: number;
  lastActiveDay: string | null;
  birthdayDiscovered: boolean;
}

export const CLOUD_KEYS: (keyof CloudState)[] = [
  'onboarded',
  'names',
  'theme',
  'soundEnabled',
  'musicEnabled',
  'saved',
  'capsules',
  'answeredCount',
  'quizPlays',
  'bestQuizScore',
  'streak',
  'lastActiveDay',
  'birthdayDiscovered',
];

/** Extract just the persistable slice from the full store state. */
export const getCloudState = (): CloudState => {
  const s = useAppStore.getState();
  return {
    onboarded: s.onboarded,
    names: s.names,
    theme: s.theme,
    soundEnabled: s.soundEnabled,
    musicEnabled: s.musicEnabled,
    saved: s.saved,
    capsules: s.capsules,
    answeredCount: s.answeredCount,
    quizPlays: s.quizPlays,
    bestQuizScore: s.bestQuizScore,
    streak: s.streak,
    lastActiveDay: s.lastActiveDay,
    birthdayDiscovered: s.birthdayDiscovered,
  };
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      names: { a: '', b: '' },
      theme: 'dark',
      soundEnabled: true,
      musicEnabled: false,
      saved: [],
      capsules: [],
      answeredCount: 0,
      quizPlays: 0,
      bestQuizScore: 0,
      streak: 0,
      lastActiveDay: null,
      birthdayDiscovered: false,

      completeOnboarding: (names) => set({ onboarded: true, names }),
      setNames: (names) => set({ names }),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      addSaved: (item) =>
        set((s) => ({
          saved: [
            { ...item, id: uid(), createdAt: Date.now() },
            ...s.saved,
          ],
        })),
      removeSaved: (id) =>
        set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),

      addCapsule: (c) =>
        set((s) => ({
          capsules: [
            { ...c, id: uid(), createdAt: Date.now(), opened: false },
            ...s.capsules,
          ],
        })),
      openCapsule: (id) =>
        set((s) => ({
          capsules: s.capsules.map((c) =>
            c.id === id ? { ...c, opened: true } : c,
          ),
        })),
      removeCapsule: (id) =>
        set((s) => ({ capsules: s.capsules.filter((c) => c.id !== id) })),

      incrementAnswered: (by = 1) =>
        set((s) => ({ answeredCount: s.answeredCount + by })),

      recordQuiz: (scorePercent) =>
        set((s) => ({
          quizPlays: s.quizPlays + 1,
          bestQuizScore: Math.max(s.bestQuizScore, Math.round(scorePercent)),
        })),

      touchStreak: () => {
        const today = dayKey();
        const { lastActiveDay, streak } = get();
        if (lastActiveDay === today) return;
        const gap = lastActiveDay ? daysBetween(today, lastActiveDay) : null;
        const next = gap === 1 ? streak + 1 : 1;
        set({ lastActiveDay: today, streak: next });
      },

      discoverBirthday: () => set({ birthdayDiscovered: true }),

      snapshot: () => {
        const s = get();
        return {
          answeredCount: s.answeredCount,
          savedCount: s.saved.length,
          capsuleCount: s.capsules.length,
          quizPlays: s.quizPlays,
          streak: s.streak,
          bestQuizScore: s.bestQuizScore,
        };
      },

      resetAll: () =>
        set({
          saved: [],
          capsules: [],
          answeredCount: 0,
          quizPlays: 0,
          bestQuizScore: 0,
          streak: 0,
          lastActiveDay: null,
        }),

      applyCloudState: (data) => {
        const next: Partial<CloudState> = {};
        for (const key of CLOUD_KEYS) {
          if (data[key] !== undefined) {
            // @ts-expect-error index assignment across the union is safe here
            next[key] = data[key];
          }
        }
        set(next);
      },
    }),
    {
      name: 'pairup-store-v1',
    },
  ),
);
