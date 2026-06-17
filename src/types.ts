export type ThemeMode = 'dark' | 'light';

export type CategoryId =
  | 'deep'
  | 'funny'
  | 'love'
  | 'dreams'
  | 'childhood'
  | 'future'
  | 'datenight'
  | 'random'
  | 'birthday';

export interface Category {
  id: CategoryId;
  title: string;
  emoji: string;
  description: string;
  /** CSS gradient applied to the category card */
  gradient: string;
}

export interface Question {
  id: string;
  category: CategoryId;
  text: string;
}

/** A question saved to the couple's journey / favorites. */
export interface SavedItem {
  id: string;
  questionId: string;
  questionText: string;
  category: CategoryId;
  /** Optional answers captured in turn-based mode. */
  answerA?: string;
  answerB?: string;
  note?: string;
  createdAt: number;
}

/** A time capsule message to be opened at a future date. */
export interface Capsule {
  id: string;
  title: string;
  message: string;
  author: 'a' | 'b';
  createdAt: number;
  /** ISO date string (yyyy-mm-dd) when the capsule unlocks. */
  openAt: string;
  opened: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Returns 0..1 completion ratio given the current state. */
  progress: (state: ProgressSnapshot) => number;
}

export interface ProgressSnapshot {
  answeredCount: number;
  savedCount: number;
  capsuleCount: number;
  quizPlays: number;
  streak: number;
  bestQuizScore: number;
}

export interface Milestone {
  date: string;
  title: string;
  description: string;
  emoji: string;
}

export interface LoveCard {
  emoji: string;
  title: string;
  body: string;
}

/** A single question answered by both partners during a date session. */
export interface SessionQA {
  q: string;
  a: string;
  b: string;
}

/** A completed (or in-progress) date session, saved to the couple's history. */
export interface DateSessionRecord {
  id: string;
  createdAt: number;
  daresDone: number;
  daresTotal: number;
  qa: SessionQA[];
  /** Compatibility score (0–100) returned by ChatGPT and entered manually. */
  gptScore: number | null;
  /** ISO day (yyyy-mm-dd) of the actual date, if set. */
  date?: string;
  /** What the date was for, e.g. "יום שנה". */
  occasion?: string;
  /** Free-text description of what they ate. */
  mealDesc?: string;
  /** Small resized photo of the meal, as a data URL. */
  mealPhoto?: string;
}
