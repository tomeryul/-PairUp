# PairUp 💞 — חוויית שיחה זוגית פרימיום

> אפליקציית ווב (SPA) רומנטית, אישית ובעברית מלאה (RTL), שהופכת את מסורת השאלות הזוגיות לחוויה בלתי נשכחת. נבנתה כמתנת יום הולדת.

אפליקציה מתקדמת בסגנון iPhone פרימיום: עיצוב גלאסמורפיזם, אנימציות חלקות, מצב כהה/בהיר, תמיכת PWA ואופליין, והכול בעברית טבעית עם תמיכת RTL מובנית.

---

## ✨ תכונות

| תכונה | תיאור |
| --- | --- |
| 🪄 חווית פתיחה | אונבורדינג מונפש עם ברכה אישית |
| 💬 קטגוריות שאלות | 8 קטגוריות, מאות שאלות בעברית טבעית |
| 🔁 מצב תורות | כל אחד עונה, וחושפים את התשובות אחת-אחת |
| 💝 המסע שלנו | שמירת רגעים ותשובות, תצוגת זכרונות וציר זמן |
| ⏳ קפסולות זמן | מסרים שנפתחים בתאריך עתידי |
| 🧠 חידון היכרות | ניחוש תשובות בן/בת הזוג + ציון תאימות |
| ☀️ שאלה יומית | שאלה אחת מיוחדת בכל יום |
| 🎲 מחולל הפתעות | אתגרים רומנטיים ורעיונות לדייט |
| 🏆 הישגים | אבני דרך ורצף שיחות יומי |
| 🎵 אווירה | מוזיקת רקע מרגיעה ואפקטים קוליים (Web Audio) |
| 🎁 מצב יום הולדת | חוויה רגשית מוסתרת: מכתב אהבה, "למה אני אוהב אותך", ציר זמן והפתעה סופית |

### 🎁 איך מפעילים את מצב יום הולדת

מצב יום ההולדת **מוסתר**. כדי לחשוף אותו: לחצו 5 פעמים על הלב ❤️ שבפינת מסך הבית.
לאחר הגילוי, הוא נשאר זמין גם דרך מסך ההגדרות.

---

## 🏗️ ארכיטקטורה

```
src/
├── main.tsx               # נקודת כניסה + HashRouter (תואם GitHub Pages)
├── App.tsx                # שלד האפליקציה, ניתוב, מעברי עמודים
├── types.ts               # טיפוסי TypeScript משותפים
├── styles/
│   ├── tokens.css         # מערכת עיצוב: צבעים, גרדיאנטים, מרווחים, טיפוגרפיה
│   └── global.css         # איפוסים, RTL, utilities
├── store/
│   └── useAppStore.ts     # Zustand + persist (localStorage) + סנכרון ענן
├── auth/
│   └── AuthProvider.tsx   # Context: מצב התחברות, allow-list, הפעלת סנכרון
├── hooks/
│   ├── useTheme.ts        # החלת מצב כהה/בהיר
│   ├── useSound.ts        # אפקטים קוליים (Web Audio, ללא קבצים)
│   └── useDailyQuestion.ts# שאלה יומית דטרמיניסטית
├── lib/
│   ├── date.ts            # פורמט תאריכים ישראלי
│   ├── firebase.ts        # אתחול Firebase מתוך משתני סביבה
│   └── cloudSync.ts       # סנכרון דו-כיווני בין הסטור ל-Firestore
├── data/                  # תוכן: שאלות, קטגוריות, חידון, הישגים, יום הולדת
├── components/            # רכיבים משותפים (רקע, ניווט, אפקטים, UI)
└── features/              # כל מסך הוא feature עצמאי
    ├── auth/  onboarding/  home/  categories/  play/  journey/
    ├── capsules/  quiz/  surprise/  achievements/  daily/
    └── settings/  birthday/
```

### החלטות מפתח
- **Firebase Auth + Firestore** — התחברות Google (allow-list), כל ההתקדמות בענן.
- **HashRouter** — ניתוב יציב באחסון סטטי ללא צורך ב-`404.html`.
- **Zustand + persist** — מטמון מקומי ב-`localStorage`; כשמחוברים, Firestore הוא
  מקור האמת והנתונים מסתנכרנים אוטומטית (עם הגנה מפני לולאת echo).
- **Web Audio API** — צלילים ומוזיקה נוצרים בקוד, אפס קבצי מדיה, עובד אופליין.
- **Framer Motion** — אנימציות 60fps, מעברי עמודים, `layoutId` לניווט.
- **CSS Variables** — מערכת עיצוב אחת, שני נושאים (כהה/בהיר), RTL מלא עם `inset-inline`.

---

## 💾 מבנה האחסון (localStorage כמטמון + Firestore כמקור אמת)

```ts
{
  onboarded: boolean,
  names: { a: string, b: string },
  theme: 'dark' | 'light',
  soundEnabled: boolean, musicEnabled: boolean,
  saved: SavedItem[],         // זכרונות + תשובות
  capsules: Capsule[],        // קפסולות זמן
  answeredCount, quizPlays, bestQuizScore, streak, lastActiveDay,
  birthdayDiscovered: boolean,
}
```

---

## 🚀 הרצה מקומית

```bash
npm install
npm run dev        # פיתוח
npm run build      # בנייה לפרודקשן
npm run preview    # תצוגה מקדימה של ה-build
```

לפני הרצה ראשונה יש להגדיר את Firebase (ראו למטה) וליצור קובץ `.env`.

---

## 🔐 התחברות וסנכרון נתונים (Firebase)

האפליקציה משתמשת ב-**Firebase Authentication** (התחברות עם Google, רק למשתמשים
מאושרים מראש) וב-**Cloud Firestore** לשמירת כל ההתקדמות בענן וסנכרון בין מכשירים.

### הגדרה חד-פעמית

1. **צרו פרויקט** ב-[Firebase Console](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → הפעילו **Google**.
3. **Firestore Database** → צרו מסד נתונים (Production mode).
4. **Project settings → General → Your apps → Web app** → העתיקו את ערכי ה-SDK.
5. בשורש הפרויקט: `cp .env.example .env` ומלאו את הערכים, כולל
   `VITE_ALLOWED_EMAILS` — רשימת האימיילים (של Google) שמורשים להיכנס.
   כל מי שמנסה להיכנס עם אימייל שלא ברשימה — נחסם אוטומטית.
6. פרסמו את חוקי האבטחה של Firestore: `firebase deploy --only firestore:rules`
   (הקובץ `firestore.rules` מתיר לכל משתמש לגשת רק למסמך שלו).

> **"רק משתמשים קיימים":** עם התחברות Google אין הרשמה עצמית באפליקציה — הגישה
> נשלטת לחלוטין דרך רשימת `VITE_ALLOWED_EMAILS`. כדי להוסיף משתמש, הוסיפו את
> האימייל שלו לרשימה ובנו מחדש. כדי להסיר גישה — הסירו אותו מהרשימה.

מבנה הנתונים ב-Firestore: מסמך אחד לכל משתמש בנתיב `users/{uid}` המכיל את כל
שדות ההתקדמות (זכרונות, קפסולות, הישגים, העדפות וכו').

---

## 🌐 פריסה ל-Firebase Hosting

**אפשרות א׳ — ידנית (הכי פשוט):**

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # בחרו את הפרויקט שלכם (מעדכן את .firebaserc)
npm run build
firebase deploy --only hosting
```

הכתובת תהיה `https://<project-id>.web.app`.

**אפשרות ב׳ — אוטומטית דרך GitHub Actions** (`.github/workflows/firebase-hosting.yml`):
הוסיפו ב-GitHub תחת **Settings → Secrets and variables → Actions** את הסודות:
`FIREBASE_SERVICE_ACCOUNT` (מפתח Service Account בפורמט JSON) וכן כל משתני
`VITE_FIREBASE_*` ו-`VITE_ALLOWED_EMAILS`. כל דחיפה לענף תבנה ותפרוס אוטומטית.

> הבנייה משתמשת ב-`base: './'` (נתיבים יחסיים), כך שהאפליקציה עובדת גם בכתובת
> השורש של Firebase וגם בתת-נתיב — ללא שינויי קוד.

---

## 🗺️ מפת דרכים

- **MVP** ✅ — אונבורדינג, קטגוריות, מצב תורות, זכרונות, שאלה יומית, מצב כהה/בהיר, PWA.
- **גרסה מתקדמת** ✅ — קפסולות זמן, חידון תאימות, הישגים, מחולל הפתעות, מוזיקה, מצב יום הולדת.
- **ענן** ✅ — התחברות Google מאובטחת, סנכרון התקדמות בין מכשירים, פריסה ב-Firebase.
- **רעיונות לעתיד** — ייצוא אלבום זכרונות PDF, התראות יומיות, שיתוף קפסולות בקישור.

---

## 🎨 התאמה אישית

כל התוכן האישי של מצב יום ההולדת נמצא ב-`src/data/birthday.ts`:
שם, מכתב האהבה, כרטיסיות "למה אני אוהב אותך", ציר הזמן וההפתעה הסופית — ערכו אותם והפכו את החוויה לשלכם. 💛
