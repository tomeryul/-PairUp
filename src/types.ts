import type { IconName } from '@/components/ui/Icon';

export type ThemeMode = 'dark' | 'light';

export type CategoryId =
  | 'aboutus'
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
  /** Line-icon name from the Icon component. */
  icon: IconName;
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
  icon: IconName;
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
  icon: IconName;
}

export interface LoveCard {
  emoji: string;
  icon: IconName;
  title: string;
  body: string;
}

/** A single question answered by both partners during a date session. */
export interface SessionQA {
  q: string;
  a: string;
  b: string;
}

/** A moment captured during a session (e.g. a meal), with note and/or photo. */
export interface SessionMoment {
  note?: string;
  photo?: string;
  createdAt: number;
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
  /** Moments captured during/after the date (meals, snapshots, notes). */
  moments?: SessionMoment[];
}
