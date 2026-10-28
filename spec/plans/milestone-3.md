# Milestone 3: התקנה בטלפון

## המטרה
מתקינים את האפליקציה במסך הבית, והיא נפתחת במסך מלא.

## תכנון (2026-10-28)

### קבצים
| קובץ | מה משתנה |
|---|---|
| manifest.webmanifest | חדש |
| sw.js | חדש |
| index.html | קישור ל-manifest, ‏theme-color, אייקון לאייפון, ורישום של sw.js |
| api/joke.js | בלי שינוי |

### manifest.webmanifest
- `name: "בדיחה בלחיצה"`, ‏`short_name: "בדיחה"`, ‏`description`.
- `start_url: "/"`, ‏`scope: "/"`, ‏`display: "standalone"`.
- `lang: "he"`, ‏`dir: "rtl"`.
- `theme_color` ו-`background_color`: ‏`#FFE15A`.
- אייקונים: `assets/icon-192.png` ‏(192), ‏`assets/icon-512.png` ‏(512), ו-`assets/icon-512-maskable.png` ‏(512, ‏`purpose: maskable`).

### index.html
- `<link rel="manifest" href="manifest.webmanifest">`.
- `<meta name="theme-color" content="#FFE15A">`.
- `<link rel="apple-touch-icon" href="assets/icon-192.png">`, כי ספארי לא לוקח אייקון מה-manifest.
- רישום של `sw.js` אחרי טעינת הדף, רק אם הדפדפן תומך.

### sw.js, לפי סעיף 7 ב-ARCHITECTURE.md
- מטמון בשם עם גרסה, `joke-v1`.
- install: שומר את `/`, ה-manifest, תשעת קבצי ה-SVG ושני האייקונים. ‏`skipWaiting`.
- activate: מוחק מטמונים בשם אחר. ‏`clients.claim`.
- fetch:
  - בקשה שאינה GET, לכתובת אחרת (כמו Google Fonts), או ל-`/api`: לא נוגע בה, והדפדפן מטפל בה כרגיל.
  - כל השאר: קודם רשת, ושומר עותק כשהתשובה תקינה. אין רשת: מחזיר מהמטמון. ניווט בלי עותק: מחזיר את `/`.
- network-first מבטיח שאחרי push ורענון השינוי מופיע (תנאי 5).

## בנייה (2026-10-28)
- נוספו manifest.webmanifest ו-sw.js, ו-index.html מקשר אליהם, לפי התכנון.
- נבדק מקומית, בלי שרת אמיתי:
  - ה-manifest הוא JSON תקין, ושלושת קובצי האייקונים קיימים.
  - sw.js עבר בדיקת תחביר, והאירועים שלו נבדקו מול מטמון מדומה: POST ו-GET ל-`/api` לא נוגעים בהם, וגם לא ב-Google Fonts. `/` מגיע מהרשת ונשמר. בלי רשת: `/` חוזר מהמטמון. אף כתובת של `/api` לא נשמרה. מטמון ישן נמחק.
  - חלונית הדפדפן של Claude לא מאפשרת רישום של service worker. לכן הבדיקה של Application ‏(Manifest ו-Cache Storage) נעשית ב-Chrome, בשלב ההרצה.
