import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

/** Syncs the chosen theme to the document root and meta theme-color. */
export function useTheme() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#ecd6dc' : '#f7edf0');
    }
  }, [theme]);

  return theme;
}
