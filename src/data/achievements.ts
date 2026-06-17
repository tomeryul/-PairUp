import type { Achievement } from '@/types';

export const achievements: Achievement[] = [
  {
    id: 'first-question',
    title: 'הצעד הראשון',
    description: 'עניתם על השאלה הראשונה שלכם',
    emoji: '🌱',
    progress: (s) => Math.min(1, s.answeredCount / 1),
  },
  {
    id: 'hundred-questions',
    title: 'מאה שיחות',
    description: 'עניתם על 100 שאלות יחד',
    emoji: '💯',
    progress: (s) => Math.min(1, s.answeredCount / 100),
  },
  {
    id: 'first-memory',
    title: 'הזיכרון הראשון',
    description: 'שמרתם רגע ראשון לזכרונות',
    emoji: '📸',
    progress: (s) => Math.min(1, s.savedCount / 1),
  },
  {
    id: 'memory-keeper',
    title: 'שומרי הרגעים',
    description: 'אספתם 25 זכרונות יקרים',
    emoji: '💎',
    progress: (s) => Math.min(1, s.savedCount / 25),
  },
  {
    id: 'first-capsule',
    title: 'מסר לעתיד',
    description: 'יצרתם קפסולת זמן ראשונה',
    emoji: '⏳',
    progress: (s) => Math.min(1, s.capsuleCount / 1),
  },
  {
    id: 'quiz-master',
    title: 'מכירים זה את זה',
    description: 'שיחקתם בחידון ההיכרות חמש פעמים',
    emoji: '🧠',
    progress: (s) => Math.min(1, s.quizPlays / 5),
  },
  {
    id: 'perfect-match',
    title: 'נשמות תאומות',
    description: 'השגתם ציון מושלם בחידון',
    emoji: '💞',
    progress: (s) => (s.bestQuizScore >= 100 ? 1 : 0),
  },
  {
    id: 'streak-7',
    title: 'שבוע של קרבה',
    description: 'שבעה ימים רצופים של שיחה',
    emoji: '🔥',
    progress: (s) => Math.min(1, s.streak / 7),
  },
];
