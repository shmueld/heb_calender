# לוח שנה עברי | Hebrew Calendar

---

## עברית

### תיאור
אפליקציית לוח שנה עברי/לועזי הפועלת בדפדפן, ללא שרת ואינטרנט.  
הלוח מציג חודש עברי יחד עם התאריכים הלועזיים המקבילים, ולכל יום מחשב ומציג את כל המופעים — ב-100 השנים האחרונות והבאות — שבהם אותו תאריך עברי ואותו תאריך לועזי (יום+חודש) חפפו.

### תכונות עיקריות
- **לוח חודשי** — תצוגת רשת עם תאריך עברי ולועזי לכל תא
- **אירועים יהודיים** — חגים, ראשי חודשים, פרשות שבוע, צומות ושבתות מיוחדות
- **התאמות תאריכים** — לכל יום: רשימת השנים (עד 100 שנה לכל כיוון) שבהן אותו צירוף עברי-לועזי חזר, כולל ההפרש בשנים מאז המופע הקודם
- **קביעות השנה** — תצוגת קוד הקביעות (כגון גכה, בשז) עם פירוט: סוג השנה, מספר ימים, יום ר"ה ויום פסח
- **ניווט חודש/שנה** — כפתורים לחודש קודם/הבא ושנה קודמת/הבאה
- **קפיצה לתאריך** — קפיצה לכל תאריך עברי או לועזי שרירותי
- **עיצוב רספונסיבי** — תצוגה מותאמת לשולחן עבודה ולנייד

### מבנה הפרויקט
```
index.html          — מבנה הדף
css/style.css       — עיצוב
js/app.js           — ניהול מצב, ניווט, סיידבר
js/calendar.js      — חישובי לוח: נתוני חודש, התאמות, קביעות שנה
js/monthView.js     — רינדור רשת הלוח ופאנל הפרטים לנייד
```

### הרצה
```bash
npm install
```
פתח את `index.html` בדפדפן (או הגש דרך כל שרת סטטי).  
אין צורך בבנייה — הקוד רץ ישירות בדפדפן כ-ES modules.

### תלויות
- [`@hebcal/core`](https://github.com/hebcal/hebcal-es6) v6 — חישובי לוח עברי, אירועים, גמטריא
- גופן [Heebo](https://fonts.google.com/specimen/Heebo) מ-Google Fonts

---

## English

### Description
A browser-only Hebrew/Gregorian dual calendar with no server or build step required.  
Each month is displayed as a grid showing both the Hebrew and Gregorian date for every day. For each day, the app computes every year within ±100 years where the same Hebrew day+month falls on the same Gregorian day+month — and shows how many years have elapsed since the previous such occurrence.

### Features
- **Monthly grid** — each cell shows the Hebrew date and Gregorian day number
- **Jewish events** — holidays, Rosh Chodesh, weekly Torah portions, fasts, and special Shabbatot
- **Date coincidences** — for every day: a list of past and future years (up to 100 in each direction) in which the same Hebrew–Gregorian combination recurred, annotated with the gap in years since the previous occurrence
- **Year type (קביעות)** — displays the 3-letter year-type code (e.g. גכה, בשז) with breakdown: regular/leap, deficient/regular/complete, total days, day of Rosh Hashana, and day of Passover
- **Month & year navigation** — buttons to step forward/back by month or by full Hebrew year
- **Jump to date** — jump to any arbitrary Hebrew or Gregorian date
- **Responsive layout** — adapted for both desktop (sidebar) and mobile (detail panel)

### Project structure
```
index.html          — page markup
css/style.css       — styles
js/app.js           — state management, navigation, sidebar
js/calendar.js      — calendar logic: month data, coincidences, year type
js/monthView.js     — month grid renderer and mobile detail panel
```

### Running
```bash
npm install
```
Open `index.html` in a browser (or serve via any static file server).  
No build step needed — the code runs directly as ES modules in the browser.

### Dependencies
- [`@hebcal/core`](https://github.com/hebcal/hebcal-es6) v6 — Hebrew calendar calculations, events, gematria
- [Heebo](https://fonts.google.com/specimen/Heebo) font from Google Fonts
