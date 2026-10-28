# בדיחה בלחיצה - הנחיות לעבודה

## המסמכים
- מסמכי האיפיון בתיקייה `spec/`: PRD.md, MVP.md, product-10-definitions.md, MILESTONES.md, ARCHITECTURE.md, tech-stack.md, DESIGN.md, course-stack.md, ותמונות הייחוס (wireframes, mockups, style-guide).
- תיקיית `assets/` נשארת בשורש, כי האפליקציה משתמשת בה.
- לפני כל עבודה: לקרוא את המסמכים הרלוונטיים. לפני שאלות: קודם לקרוא את הקבצים.

## שפה
- האפליקציה בעברית, מימין לשמאל (`lang="he"`, `dir="rtl"`).
- התקשורת איתי בעברית.

## הנחיה שוטפת
- בהקמה ובכל מיילסטון: להנחות אותי צעד אחר צעד מה השלב הבא. עניינית, קצרה וברורה.
- בסוף כל מיילסטון: לעצור ולחכות לבדיקה ולאישור מפורש שלי לפני שממשיכים.

## מפתחות - חוק ברזל
- לא לבקש ממני אף מפתח.
- לא לכתוב ולא לקרוא מפתח בשום קובץ. `.env` ו-`.env.*` חסומים לקריאה ב-`.claude/settings.json`.
- מפתח ה-production שמור אצלי ב-Vercel (Secret, ב-Production וב-Preview).
- מפתח ה-dev אני מדביק בעצמי ב-`.env.local`.
- `.env.example` מכיל רק את השורות `OPENAI_API_KEY=` ו-`SUPABASE_SECRET_KEY=`, בלי ערכים ובלי הערות.
- המפתח הסודי של Supabase שמור אצלי ב-Vercel (`SUPABASE_SECRET_KEY`, ‏Secret). אותו חוק: לא לבקש, לא לכתוב ולא לקרוא.

## Supabase - שמירה
- Supabase הוא מקום השמירה (מ-Milestone 4).
- רק הפונקציות בתיקיית `api` מדברות איתו, דרך לקוח אחד ב-`lib/supabase.js`.
- הדף מדבר רק עם `/api`. בדף אין כתובת של Supabase, אין מפתח, ואין את החבילה של Supabase.
- הטבלה נעולה: RLS בלי policy, והרשאות ל-`service_role` בלבד.

## Git ופריסה
- ריפו ציבורי: `EyalG1980/joke-app-new-28-10-2026`, ענף main בלבד.
- `.gitignore` מתעלם מ-`.env`, `.env.*`, `.vercel`, `node_modules`, עם החריגה `!.env.example`.
- הלינק החי ב-Vercel, לא ב-GitHub Pages. ב-Milestone 1 אני מייבא את הריפו ל-Vercel ושומר בו את המפתח. מאז כל push מתעדכן לבד.
- בסוף כל שלב: לספק לי את הלינק החי.

## מיילסטונים
- בונים לפי `spec/MILESTONES.md`, מיילסטון אחרי מיילסטון. כל מיילסטון בשיחה חדשה באותה תיקייה, ששמה כשם הקובץ (milestone-1 וכו').
- ארבעה שלבים לכל מיילסטון:
  1. **תכנון**
  2. **בנייה**
  3. **הרצה** - כדי שאבדוק: בכתובת של Vercel, או במחשב עם `vercel dev`, לפי מה שאבחר.
  4. **דחיפה** - push ל-main, ואז הלינק החי.
- אחרי תכנון או בנייה של כל מיילסטון: לתעד בקובץ `spec/plans/milestone-N.md`.

## מודל מומלץ
- הקמה: Sonnet.
- Milestone 1 (מסך ועיצוב): Opus.
- Milestone 2 (GPT-5), Milestone 3 (PWA) ו-Milestone 4 (Supabase): Sonnet.
