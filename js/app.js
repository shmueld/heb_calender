import { getMonthData, getHebrewMonthAndYearLabel, monthsInYear } from './calendar.js';
import { renderMonthView } from './monthView.js';

const { HDate, HDate: { isLeapYear } } = window.hebcal;

const GREG_MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני',
                        'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

// Civil month order within a Hebrew year: Tishrei (7) … Elul (6)
function civilOrder(hebYear) {
  return isLeapYear(hebYear)
    ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]
    : [7, 8, 9, 10, 11, 12,      1, 2, 3, 4, 5, 6];
}

// Derive Gregorian month/year from the middle of a Hebrew month
function gregFromHeb(hebYear, hebMonth) {
  const greg = new HDate(15, hebMonth, hebYear).greg();
  return { gregYear: greg.getFullYear(), gregMonth: greg.getMonth() + 1 };
}

const todayHeb = new HDate(new Date());
const initGreg = gregFromHeb(todayHeb.getFullYear(), todayHeb.getMonth());

const state = {
  hebrewYear:  todayHeb.getFullYear(),
  hebrewMonth: todayHeb.getMonth(),
  gregYear:    initGreg.gregYear,
  gregMonth:   initGreg.gregMonth,
};

const appEl   = document.getElementById('app');
const titleEl = document.getElementById('current-title');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

function updateTitle() {
  const hebPart  = getHebrewMonthAndYearLabel(state.hebrewYear, state.hebrewMonth);
  const gregPart = `${GREG_MONTHS_HE[state.gregMonth - 1]} ${state.gregYear}`;
  titleEl.textContent = `${hebPart} – ${gregPart}`;
}

function render() {
  appEl.innerHTML = '';
  updateTitle();
  renderMonthView(appEl, getMonthData(state.hebrewYear, state.hebrewMonth));
}

function navigate(delta) {
  const order = civilOrder(state.hebrewYear);
  let idx = order.indexOf(state.hebrewMonth) + delta;

  if (idx >= order.length) {
    state.hebrewYear++;
    state.hebrewMonth = civilOrder(state.hebrewYear)[0];
  } else if (idx < 0) {
    state.hebrewYear--;
    const prev = civilOrder(state.hebrewYear);
    state.hebrewMonth = prev[prev.length - 1];
  } else {
    state.hebrewMonth = order[idx];
  }

  const g = gregFromHeb(state.hebrewYear, state.hebrewMonth);
  state.gregYear  = g.gregYear;
  state.gregMonth = g.gregMonth;
  render();
}

btnPrev.addEventListener('click', () => navigate(-1));
btnNext.addEventListener('click', () => navigate(1));

// ── Sidebar: jump to date ─────────────────────────────

const { HDate: { isLeapYear: isLeap, daysInMonth } } = window.hebcal;

const HEB_MONTHS_LEAP = [
  { n: 7, name: 'תשרי' }, { n: 8, name: 'חשון' },  { n: 9, name: 'כסלו' },
  { n: 10, name: 'טבת' }, { n: 11, name: 'שבט' },  { n: 12, name: 'אדר א׳' },
  { n: 13, name: 'אדר ב׳' },
  { n: 1, name: 'ניסן' },  { n: 2, name: 'אייר' },  { n: 3, name: 'סיון' },
  { n: 4, name: 'תמוז' },  { n: 5, name: 'אב' },    { n: 6, name: 'אלול' },
];
const HEB_MONTHS_REG = HEB_MONTHS_LEAP
  .filter(m => m.n !== 13)
  .map(m => m.n === 12 ? { n: 12, name: 'אדר' } : m);

const jhYear  = document.getElementById('jh-year');
const jhMonth = document.getElementById('jh-month');
const jhDay   = document.getElementById('jh-day');
const jhError = document.getElementById('jh-error');
const formHeb  = document.getElementById('form-heb');
const formGreg = document.getElementById('form-greg');
const tabHeb   = document.getElementById('tab-heb');
const tabGreg  = document.getElementById('tab-greg');

function populateMonthSelect(year) {
  const list = isLeap(year) ? HEB_MONTHS_LEAP : HEB_MONTHS_REG;
  const cur  = parseInt(jhMonth.value) || state.hebrewMonth;
  jhMonth.innerHTML = '';
  for (const m of list) {
    const opt = document.createElement('option');
    opt.value = m.n;
    opt.textContent = m.name;
    if (m.n === cur) opt.selected = true;
    jhMonth.appendChild(opt);
  }
}

function initSidebar() {
  jhYear.value = state.hebrewYear;
  populateMonthSelect(state.hebrewYear);
  jhMonth.value = state.hebrewMonth;
  jhDay.value = 1;
}

jhYear.addEventListener('change', () => {
  const y = parseInt(jhYear.value);
  if (y >= 5600 && y <= 6000) populateMonthSelect(y);
});

tabHeb.addEventListener('click', () => {
  tabHeb.classList.add('active');
  tabGreg.classList.remove('active');
  formHeb.hidden = false;
  formGreg.hidden = true;
});

tabGreg.addEventListener('click', () => {
  tabGreg.classList.add('active');
  tabHeb.classList.remove('active');
  formGreg.hidden = false;
  formHeb.hidden = true;
});

document.getElementById('btn-go-heb').addEventListener('click', () => {
  jhError.textContent = '';
  const year  = parseInt(jhYear.value);
  const month = parseInt(jhMonth.value);
  const day   = parseInt(jhDay.value);

  if (!year || !month || !day) { jhError.textContent = 'יש למלא את כל השדות'; return; }
  if (day < 1 || day > daysInMonth(month, year)) {
    jhError.textContent = `יום לא תקין לחודש זה (מקסימום ${daysInMonth(month, year)})`;
    return;
  }

  state.hebrewYear  = year;
  state.hebrewMonth = month;
  const g = gregFromHeb(year, month);
  state.gregYear  = g.gregYear;
  state.gregMonth = g.gregMonth;
  render();
});

document.getElementById('btn-go-greg').addEventListener('click', () => {
  const val = document.getElementById('jg-date').value;
  if (!val) return;
  const greg = new Date(val + 'T12:00:00'); // noon avoids DST edge cases
  const hd   = new HDate(greg);
  state.hebrewYear  = hd.getFullYear();
  state.hebrewMonth = hd.getMonth();
  const g = gregFromHeb(state.hebrewYear, state.hebrewMonth);
  state.gregYear  = g.gregYear;
  state.gregMonth = g.gregMonth;
  render();
});

// Collapsible sidebar
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarBody   = document.getElementById('sidebar-body');

sidebarToggle.addEventListener('click', () => {
  const open = sidebarBody.hidden;
  sidebarBody.hidden = !open;
  sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

initSidebar();
render();
