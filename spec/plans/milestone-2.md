# Milestone 2: בדיחה מ-GPT-5

## המטרה
הבדיחה מגיעה מ-GPT-5 דרך הפונקציה, והמפתח נשאר בשרת.

## תכנון

### מה נבדק בתיעוד (2026-10-28)
- Vercel: `export default { async fetch(request) }` בתיקיית api, ב-Node.js runtime. ‏`process.env` זמין. אין שינוי מ-Milestone 1.
- OpenAI Responses API: ‏POST אל `https://api.openai.com/v1/responses`, עם `model`, ‏`instructions`, ‏`input`, ‏`reasoning.effort`, ‏`max_output_tokens`.
- התשובה הגולמית: מערך `output` עם פריט `reasoning` ואחריו פריט `message`, ובו חלקים מסוג `output_text` עם `text`. השדה `output_text` ברמה העליונה הוא נוחות של ה-SDK, ולכן בודקים את שניהם.
- טוקני ה-reasoning נספרים בתוך `max_output_tokens`. תקרה נמוכה מדי מחזירה `status: "incomplete"` בלי פריט `message`. לכן התקרה 2000, הרבה מעל בדיחה קצרה.
- gpt-5 תומך ב-`effort: "low"`, ולכן השדה נשאר.

### קבצים שמשתנים
| קובץ | מה משתנה |
|---|---|
| api/joke.js | פנייה ל-OpenAI במקום התשובה הזמנית |
| index.html | בלי שינוי. ארבעת המצבים, "עוד בדיחה!" ו"לנסות שוב" כבר נבנו ב-Milestone 1 |

### api/joke.js
- רק POST, אחרת 405.
- הנושא נחתך ל-100 תווים. נושא ריק או גוף שבור: "אין נושא. ספר בדיחה כללית על החיים."
- אין מפתח בסביבה: 500, "השרת לא מוגדר כרגע", ופרטים ב-console.error.
- הגוף ל-OpenAI: `model` מ-`OPENAI_MODEL` או `gpt-5`, ‏`instructions` עם הפרומפט המרכזי, ‏`input` "נושא הבדיחה: [הנושא]", ‏`reasoning: { effort: "low" }`, ‏`max_output_tokens: 2000`.
- זמן קצוב של 25 שניות לפנייה.
- שגיאה מ-OpenAI: 502 עם הודעה בעברית לפי הקוד, והסטטוס והקוד ב-console.error:
  - 401: המפתח לא תקין.
  - `insufficient_quota`: נגמר הקרדיט.
  - `billing_hard_limit_reached`: הגענו למגבלת ההוצאה.
  - 429 אחר: יותר מדי בקשות.
  - 404 או `model_not_found`: המודל לא נמצא.
  - כל השאר: הודעה כללית.
- תשובה בלי טקסט: 502, והסטטוס וה-`incomplete_details` ב-console.error.
- `console.log` קצר לכל בדיחה: הנושא והמודל.
- בלי כותרות CORS ובלי OPTIONS.

## בנייה (2026-10-28)
- api/joke.js פונה עכשיו ל-OpenAI Responses API, לפי התכנון. index.html בלי שינוי.
- נבדק מקומית מול OpenAI מדומה (בלי מפתח אמיתי, סקריפט מחוץ לריפו):
  - "חתולים": ‏200, וה-input הוא "נושא הבדיחה: חתולים", המודל gpt-5.
  - גוף שבור או ריק: "אין נושא. ספר בדיחה כללית על החיים."
  - נושא של 150 תווים: נחתך ל-100.
  - טקסט מ-`output_text` ומ-`output[].content[]`: שניהם עובדים.
  - `incomplete` בלי message, ‏model_not_found, ‏insufficient_quota, ‏401, נפילת רשת: ‏502 עם הודעה בעברית, ושורה ב-console.error.
  - GET: ‏405. בלי מפתח: ‏500.
- הבדיקה מול GPT-5 האמיתי: בשלב ההרצה, ב-Vercel או ב-`vercel dev`.

## פריסה (2026-10-28)
- push ל-main, ‏Vercel פרס לבד, בלי Redeploy.
- בכתובת החיה: "חתולים" החזיר בדיחה על חתולים. נושא ריק החזיר בדיחה כללית.
- בקוד הדף אין `sk-`.
- ממתין לבדיקה של Eyal בטלפון, ולבדיקות 3, 4, 5 ו-7 בתנאי ההשלמה.
