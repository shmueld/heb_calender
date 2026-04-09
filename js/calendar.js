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
 * Returns { past: MatchItem[], future: MatchItem[] } sorted nearest-first.
 */
function findSameCombination(hebDay, hebMonth, gregDay, gregMonthNum, currentGregYear, currentHebYear) {
  const past = [], future = [];

  for (let y = currentHebYear - 100; y <= currentHebYear + 100; y++) {
    if (y === currentHebYear) continue;
    if (hebMonth === 13 && !HDate.isLeapYear(y)) continue;
    if (hebDay > HDate.daysInMonth(hebMonth, y)) continue;

    const cand = new HDate(hebDay, hebMonth, y);
    const cg   = cand.greg();

    if (cg.getDate() === gregDay && cg.getMonth() + 1 === gregMonthNum) {
      const candGregYear = cg.getFullYear();
      const diff = Math.abs(candGregYear - currentGregYear);
      const dd   = String(cg.getDate()).padStart(2, '0');
      const mm   = String(cg.getMonth() + 1).padStart(2, '0');
      const item = {
        hebYear: y,
        label: `${gematriya(hebDay)} ${hebMonthName(hebMonth, y)} ${gematriya(y, { limit: true })} ${dd}/${mm}/${candGregYear} (${diff} שנים)`,
      };
      if (y < currentHebYear) past.push(item);
      else future.push(item);
    }
  }

  past.sort((a, b) => b.hebYear - a.hebYear);   // nearest past first
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


export function getHebrewMonthAndYearLabel(hebYear, hebMonth) {
  const monthName = hebMonthName(hebMonth, hebYear);
  const yearStr   = gematriya(hebYear, { limit: true });
  return `${monthName} ${yearStr}`;
}
