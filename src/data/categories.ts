import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'aboutus',
    title: 'הסיפור שלנו',
    emoji: '📖',
    icon: 'book',
    description: 'עלינו ועל הדרך שלנו',
    gradient: '#ef7fa3',
  },
  {
    id: 'deep',
    title: 'שאלות עמוקות',
    emoji: '💭',
    icon: 'layers',
    description: 'שיחות שנוגעות בלב',
    gradient: '#c479a0',
  },
  {
    id: 'funny',
    title: 'שאלות מצחיקות',
    emoji: '😂',
    icon: 'smile',
    description: 'צחוק שמקרב',
    gradient: '#f3b6a0',
  },
  {
    id: 'love',
    title: 'אהבה וזוגיות',
    emoji: '❤️',
    icon: 'heart',
    description: 'הלב שלנו, גלוי',
    gradient: '#d85f86',
  },
  {
    id: 'dreams',
    title: 'החלומות שלנו',
    emoji: '🌍',
    icon: 'globe',
    description: 'לאן הלב לוקח אותנו',
    gradient: '#b98ac4',
  },
  {
    id: 'childhood',
    title: 'זכרונות ילדות',
    emoji: '👶',
    icon: 'balloon',
    description: 'מאיפה באנו',
    gradient: '#ef9ec0',
  },
  {
    id: 'future',
    title: 'העתיד שלנו',
    emoji: '✨',
    icon: 'sun',
    description: 'מה שעוד מחכה לנו',
    gradient: '#e8b84b',
  },
  {
    id: 'datenight',
    title: 'לילה של דייט',
    emoji: '🍷',
    icon: 'moon',
    description: 'שאלות לאור נרות',
    gradient: '#a85a84',
  },
  {
    id: 'random',
    title: 'הפתעה אקראית',
    emoji: '🎲',
    icon: 'spark',
    description: 'משאירים את זה לגורל',
    gradient: '#cf8fb0',
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<string, Category>;
