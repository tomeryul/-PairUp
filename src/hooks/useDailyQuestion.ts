import { useMemo } from 'react';
import { questions } from '@/data/questions';
import { dayKey } from '@/lib/date';

/** Deterministically derives one question for the current day. */
export function useDailyQuestion() {
  return useMemo(() => {
    const key = dayKey();
    // Simple stable hash of the day key.
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    const index = hash % questions.length;
    return questions[index];
  }, []);
}
