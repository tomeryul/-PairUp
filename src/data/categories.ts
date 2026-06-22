import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'aboutus',
    title: 'הסיפור שלנו',
    emoji: '📖',
    icon: 'book',
    description: 'עלינו ועל הדרך שלנו',
    gradient: '#EF9080',
  },
  {
    id: 'deep',
    title: 'שאלות עמוקות',
    emoji: '💭',
    icon: 'layers',
    description: 'שיחות שנוגעות בלב',
    gradient: '#9CC0BC',
  },
  {
    id: 'funny',
    title: 'שאלות מצחיקות',
    emoji: '😂',
    icon: 'smile',
    description: 'צחוק שמקרב',
    gradient: '#E8B84B',
  },
  {
    id: 'love',
    title: 'אהבה וזוגיות',
    emoji: '❤️',
    icon: 'heart',
    description: 'הלב שלנו, גלוי',
    gradient: '#D9705E',
  },
  {
    id: 'dreams',
    title: 'החלומות שלנו',
    emoji: '🌍',
    icon: 'globe',
    description: 'לאן הלב לוקח אותנו',
    gradient: '#84ABA6',
  },
  {
    id: 'childhood',
    title: 'זכרונות ילדות',
    emoji: '👶',
    icon: 'balloon',
    description: 'מאיפה באנו',
    gradient: '#F4A695',
  },
  {
    id: 'future',
    title: 'העתיד שלנו',
    emoji: '✨',
    icon: 'sun',
    description: 'מה שעוד מחכה לנו',
    gradient: '#A9D178',
  },
  {
    id: 'datenight',
    title: 'לילה של דייט',
    emoji: '🍷',
    icon: 'moon',
    description: 'שאלות לאור נרות',
    gradient: '#6E938E',
  },
  {
    id: 'random',
    title: 'הפתעה אקראית',
    emoji: '🎲',
    icon: 'spark',
    description: 'משאירים את זה לגורל',
    gradient: '#84ABA6',
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<string, Category>;
