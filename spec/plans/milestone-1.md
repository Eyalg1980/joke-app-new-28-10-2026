# Milestone 1: Walking Skeleton

## המטרה
הדף והפונקציה באוויר ב-Vercel, באותה כתובת, ומדברים זה עם זה. בלי AI.

## תכנון

### קבצים חדשים
| קובץ | מה בו |
|---|---|
| index.html | המסך הראשי לפי DESIGN.md, עם ה-CSS וה-JavaScript בתוכו |
| api/joke.js | `export default { async fetch(request) }`. מקבלת POST עם `{ topic }`, מחזירה `{ joke }` זמנית |
| package.json | `"type": "module"`, בלי dependencies |

### קבצים קיימים מההקמה (בודקים, לא יוצרים)
- `.gitignore`: ‏.env, ‏.env.*, ‏!.env.example, ‏.vercel, ‏node_modules.
- `.env.example`: קיים (16 בתים, השורה `OPENAI_API_KEY=`). לא נקרא, כי הוא חסום ל-Claude.
- `.claude/settings.json`: חוסם קריאה של .env ו-.env.*.

### index.html
- `lang="he"`, ‏`dir="rtl"`, ‏viewport לטלפון.
- Google Fonts: ‏Fredoka ‏(500, 600, 700) ו-Playpen Sans Hebrew ‏(500), עם גיבוי ל-system-ui.
- צבעים כמשתני CSS לפי ה-Style Guide.
- רקע: bg-dots.svg חוזר, bg-doodles.svg פעם אחת למעלה במרכז.
- מלמעלה למטה: לוגו (300), שורת הסבר, תווית ותיבה (maxlength 100), כפתור, בועה עם הדמות, תחתית.
- הבועה עם `data-state`: idle / think / joke / error. כל מצב מחליף את ציור הדמות, הטקסט והכפתור, כולל התנועות ו-prefers-reduced-motion.
- אזור הבדיחה עם `aria-live="polite"`.
- בשליחה: POST ל-/api/joke, הצגת `joke` עם textContent. שגיאה ברשת או סטטוס לא תקין: מצב שגיאה.

### api/joke.js
- רק POST. שיטה אחרת: 405 עם `{ error }`.
- גוף שבור או נושא ריק: "אין נושא". הנושא נחתך ל-100 תווים.
- `OPENAI_API_KEY` קיים: "המפתח: נמצא", אחרת "המפתח: חסר". לעולם לא המפתח עצמו.
- `console.log` קצר לכל בקשה, כדי לראות שורה ב-Logs.
- בלי כותרות CORS ובלי טיפול ב-OPTIONS.

### החלטות
- ב-Milestone 1 כבר בונים את ארבעת המצבים ב-CSS, כי הם חלק מהעיצוב. מצב הבדיחה מקבל את התשובה הזמנית.
- טקסט התשובה בלי נושא: "בדיחה זמנית מהשרת: בלי נושא. המפתח: ...".

## בנייה (2026-10-28)
- נוצרו: index.html, ‏api/joke.js, ‏package.json.
- נבדק בשרת בדיקה זמני (לא בריפו), ברוחב טלפון 375:
  - המסך תואם ל-mockup: לוגו, הסבר, תיבה, כפתור, בועה עם הדמות, תחתית.
  - "חתולים" ולחיצה: POST אחד ל-/api/joke, סטטוס 200, הבועה במצב בדיחה, הכפתור "עוד בדיחה!".
  - גוף שבור: "בלי נושא". בקשת GET: ‏405.
  - בלי מפתח בסביבה: "המפתח: חסר", כמצופה.
- אין כותרות CORS ואין טיפול ב-OPTIONS.

## השלבים הבאים
1. push ל-main.
2. ב-Vercel: ‏New Project, ‏Import לריפו, ‏Framework Preset: Other, ‏Deploy.
3. ביד: מפתח production בשם `joke-in-a-click` ב-OpenAI, ושמירה ב-Vercel כ-`OPENAI_API_KEY` (Secret, ‏Production ו-Preview), ואז Redeploy.
4. בדיקה בטלפון לפי תנאי ההשלמה.
