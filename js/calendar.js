// Data layer — all interaction with window.hebcal happens here.
// window.hebcal is set by the IIFE bundle before this module runs.

const { HebrewCalendar, HDate, flags, gematriya, Locale } = window.hebcal;

export function monthsInYear(hebYear) {
  return HDate.isLeapYear(hebYear) ? 13 : 12;
}


function hebMonthName(hebMonth, hebYear) {
  return Locale.gettext(new HDate(1, hebMonth, hebYear).getMonthName(), 'he-x-NoNikud');
}

function eventType(ev) {
  const f = ev.getFlags();
  if (f & flags.ROSH_CHODESH)    return 'rosh-chodesh';
  if (f & flags.PARSHA_HASHAVUA) return 'parasha';
  if (f & flags.CHAG)            return 'chag';
  if (f & flags.MINOR_FAST || f & flags.MAJOR_FAST) return 'fast';
  if (f & flags.SPECIAL_SHABBAT) return 'special-shabbat';
  if (f & flags.MODERN_HOLIDAY)  return 'modern';
  return 'other';
}

function buildEventMap(hebcalEvents) {
  const map = new Map();
  for (const ev of hebcalEvents) {
    const iso = ev.getDate().greg().toISOString().slice(0, 10);
    if (!map.has(iso)) map.set(iso, []);
    map.get(iso).push({
      type: eventType(ev),
      heText: ev.render('he-x-NoNikud'),
    });
  }
  const order = ['chag', 'rosh-chodesh', 'parasha', 'fast', 'special-shabbat', 'modern', 'other'];
  for (const [, evts] of map) {
    evts.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }
  return map;
}

/**
 * For a given Hebrew day+month and Gregorian day+month, find all years
 * within ±100 Hebrew years where the same combination occurs.
 * The number in parentheses for each entry is the gap (in Gregorian years)
 * from the *previous* occurrence to *this* occurrence.
 * Returns { past: MatchItem[], future: MatchItem[] } sorted nearest-first.
 */
function findSameCombination(hebDay, hebMonth, gregDay, gregMonthNum, currentGregYear, currentHebYear) {
  // Collect all occurrences including the current year (which is always a match)
  const allOccurrences = [{ hebYear: currentHebYear, gregYear: currentGregYear, date: null }];

  for (let y = currentHebYear - 100; y <= currentHebYear + 100; y++) {
    if (y === currentHebYear) continue;
    if (hebMonth === 13 && !HDate.isLeapYear(y)) continue;
    if (hebDay > HDate.daysInMonth(hebMonth, y)) continue;

    const cand = new HDate(hebDay, hebMonth, y);
    const cg   = cand.greg();

    if (cg.getDate() === gregDay && cg.getMonth() + 1 === gregMonthNum) {
      allOccurrences.push({ hebYear: y, gregYear: cg.getFullYear(), date: cg });
    }
  }

  // Sort chronologically so we can compute gap-from-previous for each entry
  allOccurrences.sort((a, b) => a.gregYear - b.gregYear);

  const past = [], future = [];

  for (let i = 0; i < allOccurrences.length; i++) {
    const occ = allOccurrences[i];
    if (occ.hebYear === currentHebYear) continue; // displayed day — skip but keep as anchor

    const prevOcc = i > 0 ? allOccurrences[i - 1] : null;
    const diff    = prevOcc !== null ? occ.gregYear - prevOcc.gregYear : null;

    const cg  = occ.date;
    const dd  = String(cg.getDate()).padStart(2, '0');
    const mm  = String(cg.getMonth() + 1).padStart(2, '0');
    const diffStr = diff !== null ? ` (${diff})` : '';

    const item = {
      hebYear: occ.hebYear,
      label: `${gematriya(hebDay)} ${hebMonthName(hebMonth, occ.hebYear)} ${gematriya(occ.hebYear, { limit: true })} ${dd}/${mm}/${occ.gregYear}${diffStr}`,
    };

    if (occ.hebYear < currentHebYear) past.push(item);
    else future.push(item);
  }

  past.sort((a, b) => a.hebYear - b.hebYear);   // earliest first
  future.sort((a, b) => a.hebYear - b.hebYear); // nearest future first
  return { past, future };
}

/**
 * Returns data for a single Hebrew month.
 * Days run from 1 of hebMonth to 29/30 of hebMonth.
 * Leading/trailing cells are filled with adjacent Hebrew month days.
 */
export function getMonthData(hebYear, hebMonth) {
  const daysInMonth = HDate.daysInMonth(hebMonth, hebYear);
  const firstHDate  = new HDate(1, hebMonth, hebYear);
  const lastHDate   = new HDate(daysInMonth, hebMonth, hebYear);

  const hebcalEvents = HebrewCalendar.calendar({
    start: firstHDate,
    end:   lastHDate,
    sedrot: true,
    il: true,
    noMinorHolidays: false,
  });
  const eventMap = buildEventMap(hebcalEvents);

  // Adjacent months for padding cells
  let prevMonth = hebMonth - 1, prevYear = hebYear;
  if (prevMonth < 1) { prevYear--; prevMonth = monthsInYear(prevYear); }
  const daysInPrev = HDate.daysInMonth(prevMonth, prevYear);

  let nextMonth = hebMonth + 1, nextYear = hebYear;
  if (nextMonth > monthsInYear(hebYear)) { nextMonth = 1; nextYear++; }

  const startDow = firstHDate.greg().getDay(); // 0=Sun
  const days = [];

  // Leading cells (from previous Hebrew month)
  for (let i = startDow - 1; i >= 0; i--) {
    const hd  = new HDate(daysInPrev - i, prevMonth, prevYear);
    const greg = hd.greg();
    const iso  = greg.toISOString().slice(0, 10);
    days.push({
      gregDate: greg, hdate: hd, iso,
      isOtherMonth: true,
      dayOfWeek: greg.getDay(),
      events: [],
      hebLabel: gematriya(hd.getDate()),
      gregLabel: greg.getDate(),
    });
  }

  // Current month days
  for (let n = 1; n <= daysInMonth; n++) {
    const hd   = new HDate(n, hebMonth, hebYear);
    const greg = hd.greg();
    const iso  = greg.toISOString().slice(0, 10);
    const matches = findSameCombination(
      n, hebMonth,
      greg.getDate(), greg.getMonth() + 1,
      greg.getFullYear(), hebYear
    );
    days.push({
      gregDate: greg, hdate: hd, iso,
      isOtherMonth: false,
      dayOfWeek: greg.getDay(),
      events: eventMap.get(iso) || [],
      hebLabel: n === 1
        ? `${gematriya(1)} ${hebMonthName(hebMonth, hebYear)}`
        : gematriya(n),
      gregLabel: greg.getDate(),
      matches,
    });
  }

  // Trailing cells (from next Hebrew month)
  const totalCells = Math.ceil(days.length / 7) * 7;
  let t = 1;
  while (days.length < totalCells) {
    const hd   = new HDate(t++, nextMonth, nextYear);
    const greg = hd.greg();
    const iso  = greg.toISOString().slice(0, 10);
    days.push({
      gregDate: greg, hdate: hd, iso,
      isOtherMonth: true,
      dayOfWeek: greg.getDay(),
      events: [],
      hebLabel: gematriya(hd.getDate()),
      gregLabel: greg.getDate(),
    });
  }

  return { days };
}


const DOW_NAMES_HEB  = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const DOW_TO_LETTER  = ['א','ב','ג','ד','ה','ו','ז'];

export function getYearInfo(hebYear) {
  const roshHashana = new HDate(1, 7, hebYear);
  const rhDow       = roshHashana.greg().getDay(); // 0=ראשון

  const nextRH     = new HDate(1, 7, hebYear + 1);
  const daysInYear = Math.round(
    (nextRH.greg().getTime() - roshHashana.greg().getTime()) / 86_400_000
  );

  const isLeap       = HDate.isLeapYear(hebYear);
  const regularDays  = isLeap ? 384 : 354;
  const yearTypeChar =
    daysInYear < regularDays ? 'ח' :
    daysInYear > regularDays ? 'ש' : 'כ';
  const yearTypeName =
    daysInYear < regularDays ? 'חסרה' :
    daysInYear > regularDays ? 'שלמה' : 'כסדרה';

  const passover = new HDate(15, 1, hebYear);
  const passDow  = passover.greg().getDay();

  return {
    typeCode:    DOW_TO_LETTER[rhDow] + yearTypeChar + DOW_TO_LETTER[passDow],
    isLeap,
    daysInYear,
    yearTypeName,
    rhDowName:   DOW_NAMES_HEB[rhDow],
    passDowName: DOW_NAMES_HEB[passDow],
  };
}

export function getHebrewMonthAndYearLabel(hebYear, hebMonth) {
  const monthName = hebMonthName(hebMonth, hebYear);
  const yearStr   = gematriya(hebYear, { limit: true });
  return `${monthName} ${yearStr}`;
}
