# ARCHITECTURE: בדיחה בלחיצה

## 1. מבנה המערכת בשלוש שכבות

### צד לקוח
- index.html אחד, עם ה-CSS וה-JavaScript בתוכו. עברית, `lang="he"` ו-`dir="rtl"`.
- הלוגו, ארבעת הציורים של הדמות והרקע הם קבצי SVG בתיקיית assets. הדף מחליף ביניהם לפי `data-state` על הבועה: idle, think, joke, error.
- טופס עם תיבה (maxlength 100) וכפתור. בשליחה: POST ל-/api/joke, ואז הצגת הבדיחה או ההודעה.
- הטקסט שחוזר מוצג עם textContent, לא innerHTML.
- מתחת לכל בדיחת AI: כפתור "צחקתי" עם מונה. לחיצה שולחת POST ל-/api/laugh, ואז הכפתור ננעל.
- רשימת "הכי מצחיקות": GET ל-/api/top כשהדף נטען, ושוב אחרי כל צחוק. בלי polling.
- הדף מדבר רק עם /api. אין בו כתובת של Supabase, אין מפתח, ואין את החבילה של Supabase.
- רושם את sw.js כ-service worker.

### לוגיקה
- שלוש Vercel Functions בתיקיית api, כל אחת עם `export default { async fetch(request) { ... } }`: joke.js, ‏laugh.js ו-top.js.
- מקבלת רק POST עם JSON: `{ "topic": "..." }`. מחזירה תמיד JSON: `{ "joke": "..." }` בהצלחה, `{ "error": "..." }` בשגיאה.
- חותכת את הנושא ל-100 תווים. נושא ריק או גוף שבור נחשבים "אין נושא".
- api/joke.js פונה ל-OpenAI, מחלצת את הטקסט, שומרת את הבדיחה בטבלה, ומחזירה את הבדיחה ואת ה-id שלה. שמירה שנכשלה לא עוצרת את הבדיחה: היא חוזרת עם `id: null`, והשגיאה נרשמת ב-console.error.
- api/laugh.js מקבלת POST עם `{ "id": "..." }`, בודקת שזה uuid, וקוראת ל-`add_laugh` דרך `rpc`.
- api/top.js מחזירה את חמש הבדיחות עם הכי הרבה צחוקים, רק כאלה עם `laughs >= 1`.
- לקוח Supabase אחד, ב-lib/supabase.js, מ-`@supabase/supabase-js`. הכתובת מ-`process.env.SUPABASE_URL` והמפתח מ-`process.env.SUPABASE_SECRET_KEY`. רק הפונקציות בתיקיית api משתמשות בו.

### נתונים
Supabase (Postgres), טבלה אחת: `public.jokes`. רק השרת ניגש אליה, עם המפתח הסודי.

## 2. מבנה הנתונים
הטבלה `public.jokes`, נוצרת ב-migration בשם `create_jokes`. ה-SQL שמור גם ב-db/create_jokes.sql.

| עמודה | סוג | הערות |
|---|---|---|
| id | uuid | מפתח ראשי, ברירת מחדל `gen_random_uuid()` |
| created_at | timestamptz | ברירת מחדל `now()` |
| topic | text | הנושא, יכול להיות ריק |
| text | text | חובה. הבדיחה |
| laughs | integer | חובה, ברירת מחדל 0 |

הפונקציה `public.add_laugh(joke_id uuid)` מוסיפה 1 ל-`laughs` בפקודת update אחת, ומחזירה את המספר החדש. כך שתי לחיצות באותו רגע לא דורסות זו את זו. היא `security invoker`, עם `search_path` ריק ושמות מלאים כמו `public.jokes`.

החוזה בין הדף לפונקציות:

| נתיב | הדף שולח | הצלחה (200) | שגיאה |
|---|---|---|---|
| POST /api/joke | `{ "topic": "חתולים" }`, או `{ "topic": "" }` | `{ "joke": "...", "id": "..." }`. ‏`id` הוא null אם השמירה נכשלה | `{ "error": "..." }`, ‏405, 500 או 502 |
| POST /api/laugh | `{ "id": "<uuid>" }` | `{ "laughs": 3 }` | `{ "error": "..." }`, ‏400 (לא uuid), 404 (לא קיים), 405 או 500 |
| GET /api/top | - | `{ "jokes": [ { "id", "topic", "text", "laughs" } ] }`, עד חמש | `{ "error": "..." }`, ‏405 או 500 |

## 3. התחברות והרשאות
אין כניסה, רמה 0. כל גולש יכול לבקש בדיחה ולצחוק. ההגנה על העלות היא אורך נושא מוגבל, ומגבלת הוצאה בחשבון OpenAI.

הנעילה של Supabase, כדי שרק השרת ייגש:
- על `public.jokes`: RLS מופעל, בלי אף policy. ‏`grant select, insert, update` ל-`service_role` בלבד, ו-`revoke all` מ-`anon` ומ-`authenticated`.
- על `public.add_laugh`: ‏`revoke execute` מ-`public`, ‏`anon` ו-`authenticated`, ו-`grant execute` ל-`service_role`.
- הפונקציות בתיקיית api מתחברות עם המפתח הסודי, שפועל בתפקיד `service_role`. המפתח הציבורי של Supabase לא בשימוש בכלל.
- הנעילה בצד הדף פשוטה: הכפתור ננעל אחרי לחיצה. אין מניעה בשרת של כמה צחוקים מאותו גולש.

## 4. שכבת ה-AI
- הקריאה: POST אל `https://api.openai.com/v1/responses`, מתוך הפונקציה בלבד, עם הכותרת `Authorization: Bearer <OPENAI_API_KEY>`.
- הגוף: `model` מ-OPENAI_MODEL או `gpt-5`, ‏`instructions` עם הפרומפט המרכזי, `input` עם הנושא, ‏`reasoning: { effort: "low" }` ו-`max_output_tokens`.
- הפרומפט המרכזי: "אתה כותב בדיחות קצרות בעברית. כתוב בדיחה אחת בלבד, עד ארבעה משפטים, נקייה ומתאימה לכל גיל. בלי הקדמה, בלי הסבר ובלי אימוג׳י. רק הבדיחה."
- ה-input: "נושא הבדיחה: [הנושא]". בלי נושא: "אין נושא. ספר בדיחה כללית על החיים."
- התשובה: לוקחים את `output_text` אם קיים. אחרת, את הטקסט מהפריטים מסוג `message` במערך `output`, בחלקים מסוג `output_text`. אין טקסט: שגיאה.
- שגיאה מ-OpenAI: הסטטוס והקוד נרשמים ב-console.error, והדף מקבל הודעה קצרה בעברית לפי הקוד: 401, נגמר הקרדיט, מגבלת הוצאה, 429, 404.
- לפני כתיבת הקוד בודקים בתיעוד העדכני של OpenAI ושל Vercel את מבנה הבקשה והתשובה.

## 5. אינטגרציות, APIs ואוטומציות
- OpenAI Responses API, מ-api/joke.js.
- Supabase, דרך `@supabase/supabase-js`, מהפונקציות בתיקיית api בלבד. הדף מדבר רק עם /api.
- אין אוטומציות ואין שירותים נוספים.

## 6. מפתחות וסודות
| השם | איפה | סוג | מה הוא |
|---|---|---|---|
| OPENAI_API_KEY | Vercel, Environment Variables, ב-Production וב-Preview | Secret | מפתח ה-production, ‏joke-in-a-click. רק הפונקציה קוראת אותו |
| OPENAI_API_KEY | .env.local במחשב, רק בהרצה מקומית | קובץ שלא נכנס לריפו | מפתח dev נפרד, ‏joke-in-a-click-dev. הסטודנט מדביק אותו ביד |
| OPENAI_MODEL | Vercel, Environment Variables | Config, לא חובה | שם המודל. בלי המשתנה: gpt-5 |
| SUPABASE_SECRET_KEY | Vercel, Environment Variables, ב-Production וב-Preview | Secret | המפתח הסודי של Supabase (service_role). רק הפונקציות בתיקיית api קוראות אותו |
| SUPABASE_URL | Vercel, Environment Variables, ב-Production וב-Preview | Config, לא סוד | כתובת הפרויקט ב-Supabase |
| SUPABASE_SECRET_KEY, ‏SUPABASE_URL | .env.local במחשב, רק בהרצה מקומית | קובץ שלא נכנס לריפו | מודבקים ביד |

- המפתח לא מופיע בשום קובץ שנכנס לריפו, ולא בצ׳אט עם Claude. היחיד: .env.local במחשב, למי שמריץ מקומית.
- מפתח ה-production נשמר ב-Vercel כבר ב-Milestone 1. אחרי כל שינוי במשתנה: Redeploy.
- .claude/settings.json חוסם ל-Claude את הקריאה של .env ושל .env.*. בריפו יש .env.example עם שתי שורות בלבד, בלי ערכים: `OPENAI_API_KEY=` ו-`SUPABASE_SECRET_KEY=`. שם המודל לא נכנס לקובץ: בלי OPENAI_MODEL הקוד משתמש ב-gpt-5.
- הדפדפן לא מקבל אף מפתח. הוא פונה רק ל-/api.
- .gitignore כולל `.env`, ‏`.env.*`, את החריגה `!.env.example`, ‏`.vercel` ו-`node_modules`. הוא נוצר לפני הקומיט הראשון.
- בחשבון OpenAI: קרדיט מראש, Auto recharge כבוי, ומגבלת הוצאה חודשית.

## 7. מבנה התיקיות של הקוד
```
index.html              המסך, עם ה-CSS וה-JavaScript
manifest.webmanifest    name, short_name, start_url, display: standalone, lang: he, dir: rtl, אייקונים
sw.js                   service worker, network-first, בלי /api. ‏CACHE עולה בכל שינוי בדף
package.json            "type": "module", ‏dependencies: @supabase/supabase-js בלבד
.gitignore              .env, .env.*, !.env.example, .vercel, node_modules
.env.example            שתי שורות: OPENAI_API_KEY= ו-SUPABASE_SECRET_KEY=, בלי ערכים ובלי הערות
.claude/settings.json   חוסם ל-Claude את הקריאה של .env ושל .env.*
assets/logo.svg
assets/mascot-idle.svg, mascot-think.svg, mascot-joke.svg, mascot-error.svg
assets/bg-dots.svg, bg-doodles.svg
assets/icon.svg, icon-maskable.svg
assets/icon-192.png, icon-512.png, icon-512-maskable.png
api/joke.js             בדיחה מ-OpenAI, ושמירה בטבלה. המקום היחיד שקורא את מפתח OpenAI
api/laugh.js            צחוק: add_laugh דרך rpc
api/top.js              "הכי מצחיקות"
lib/supabase.js         לקוח Supabase אחד. המקום היחיד שקורא את SUPABASE_SECRET_KEY
db/create_jokes.sql     ה-SQL של ה-migration create_jokes
spec/                   מסמכי האיפיון, ו-spec/plans
```

ה-service worker:
- באירוע install שומר במטמון את /, את ה-manifest, את קבצי ה-SVG מתיקיית assets ואת שני האייקונים.
- בכל בקשת GET מאותה כתובת: קודם רשת, ושומר עותק. אין רשת: מחזיר מהמטמון.
- בקשה ל-/api, בקשה שאינה GET, או בקשה לכתובת אחרת: לא נוגע בה.

## הנחות והחלטות
- בלי ai-tests.md. במקומו, חמש בדיקות ידניות בתנאי ההשלמה של Milestone 2. המוצר קטן, והפלט הוא טקסט חופשי.
- שני גופנים מ-Google Fonts, Fredoka ו-Playpen Sans Hebrew, עם גיבוי ל-system-ui. ה-service worker לא שומר אותם, כי הם מכתובת אחרת.
- CSS ו-JavaScript בתוך index.html, כי יש מסך אחד.
- `reasoning: { effort: "low" }` כדי שהבדיחה תחזור מהר. אם התיעוד העדכני לא תומך בשדה הזה במודל שנבחר, מורידים אותו.
- הפונקציה כותבת console.log קצר לכל בדיחה (הנושא והמודל), כדי לראות פניות ב-Logs.
- Supabase לשמירה (Milestone 4). דרך הפונקציות ולא ישירות מהדף, כדי שאין צורך במפתח ציבורי ובמדיניות RLS, והטבלה נעולה לגמרי מבחוץ.
- "הכי מצחיקות" מתעדכנת רק אחרי צחוק של הגולש עצמו ובטעינת הדף. בלי polling ובלי Realtime.
