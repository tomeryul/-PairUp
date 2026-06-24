import type { QuizQuestion } from '@/types';

/**
 * Quiz of "guess your partner's answer". One player picks what they think
 * their partner would choose, then the partner reveals the truth.
 */
export const quizQuestions: QuizQuestion[] = [
  {
    id: 'qz-1',
    prompt: 'איך בן/בת הזוג הכי אוהב/ת לבלות ערב פנוי?',
    options: ['בבית עם סרט', 'בחוץ עם אנשים', 'בטיול ספונטני', 'בארוחה טובה'],
  },
  {
    id: 'qz-2',
    prompt: 'מה הדרך שבה הם הכי אוהבים לקבל אהבה?',
    options: ['מילים טובות', 'מגע', 'מתנות קטנות', 'זמן איכות'],
  },
  {
    id: 'qz-3',
    prompt: 'איזו חופשה הם היו בוחרים?',
    options: ['חוף ושמש', 'עיר תוססת', 'טבע ושקט', 'הרפתקה אקזוטית'],
  },
  {
    id: 'qz-4',
    prompt: 'מה המשקה המושלם שלהם לבוקר?',
    options: ['קפה שחור', 'קפוצ׳ינו', 'תה', 'שוקו או מתוק'],
  },
  {
    id: 'qz-5',
    prompt: 'מה הכי מרגיע אותם אחרי יום קשה?',
    options: ['מוזיקה', 'אמבטיה חמה', 'שיחה איתי', 'שינה'],
  },
  {
    id: 'qz-6',
    prompt: 'איזה סוג סרטים הם הכי אוהבים?',
    options: ['קומדיה רומנטית', 'אקשן', 'דרמה', 'מתח ואימה'],
  },
  {
    id: 'qz-7',
    prompt: 'מה הם מעריכים הכי הרבה בזוגיות?',
    options: ['אמון', 'הומור', 'תשוקה', 'יציבות'],
  },
  {
    id: 'qz-8',
    prompt: 'איזו ארוחה הם היו בוחרים לארוחה אחרונה?',
    options: ['פיצה', 'סושי', 'המבורגר', 'אוכל ביתי של אמא'],
  },
];
