import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'deep',
    title: 'שאלות עמוקות',
    emoji: '💭',
    description: 'שיחות שנוגעות בלב',
    gradient: 'linear-gradient(135deg, #a06bff 0%, #6bb9ff 100%)',
  },
  {
    id: 'funny',
    title: 'שאלות מצחיקות',
    emoji: '😂',
    description: 'צחוק שמקרב',
    gradient: 'linear-gradient(135deg, #ffcf73 0%, #ff8e6e 100%)',
  },
  {
    id: 'love',
    title: 'אהבה וזוגיות',
    emoji: '❤️',
    description: 'הלב שלנו, גלוי',
    gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ff3d7f 100%)',
  },
  {
    id: 'dreams',
    title: 'החלומות שלנו',
    emoji: '🌍',
    description: 'לאן הלב לוקח אותנו',
    gradient: 'linear-gradient(135deg, #6bb9ff 0%, #a06bff 100%)',
  },
  {
    id: 'childhood',
    title: 'זכרונות ילדות',
    emoji: '👶',
    description: 'מאיפה באנו',
    gradient: 'linear-gradient(135deg, #ff9ec1 0%, #ffcf73 100%)',
  },
  {
    id: 'future',
    title: 'העתיד שלנו',
    emoji: '✨',
    description: 'מה שעוד מחכה לנו',
    gradient: 'linear-gradient(135deg, #a06bff 0%, #ff6b9d 100%)',
  },
  {
    id: 'datenight',
    title: 'לילה של דייט',
    emoji: '🍷',
    description: 'שאלות לאור נרות',
    gradient: 'linear-gradient(135deg, #ff6b9d 0%, #a06bff 100%)',
  },
  {
    id: 'random',
    title: 'הפתעה אקראית',
    emoji: '🎲',
    description: 'משאירים את זה לגורל',
    gradient: 'linear-gradient(135deg, #ff8e6e 0%, #ff6b9d 100%)',
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<string, Category>;
