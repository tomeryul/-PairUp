import type { SessionQA } from '@/types';

/**
 * Builds a ready-to-send Hebrew prompt summarising a date session's questions
 * and both partners' answers, asking ChatGPT to return a compatibility score.
 * The app itself doesn't call any AI — the user opens ChatGPT with this prompt
 * and pastes the resulting score back in.
 */
export function buildGptPrompt(
  names: { a: string; b: string },
  qa: SessionQA[],
): string {
  const blocks = qa
    .map(
      (x, i) =>
        `שאלה ${i + 1}: ${x.q}\n• ${names.a}: ${x.a.trim() || '(לא ענה/תה)'}\n• ${names.b}: ${x.b.trim() || '(לא ענה/תה)'}`,
    )
    .join('\n\n');

  return `אנחנו זוג בשם ${names.a} ו${names.b}. שיחקנו במשחק שאלות בדייט, והנה השאלות והתשובות שלנו:

${blocks}

נתח/י את מידת ההתאמה בינינו על סמך התשובות, וענה/י בעברית:
1. ציון התאמה כולל מ-0 עד 100.
2. שני תחומים שבהם אנחנו מאוד מתואמים.
3. תובנה חמה אחת שתעזור לנו להתקרב עוד יותר.

חשוב: סיים/י את התשובה בשורה נפרדת וברורה בפורמט המדויק הזה:
ציון סופי: <מספר בין 0 ל-100>`;
}

/** Opens ChatGPT with the prompt pre-filled in the composer. */
export function chatGptUrl(prompt: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
