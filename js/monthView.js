const DAY_NAMES_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const MAX_BADGES = 3;

function createDayCell(day, isToday) {
  const cell = document.createElement('div');
  cell.className = 'day-cell';

  if (day.dayOfWeek === 6) cell.classList.add('col-shabbat');
  if (day.isOtherMonth)   cell.classList.add('day-other-month');
  if (isToday)            cell.classList.add('day-today');

  // Date row: Hebrew label (right) + Gregorian number (left, visually in RTL)
  const dateRow = document.createElement('div');
  dateRow.className = 'day-date-row';

  const gregNum = document.createElement('span');
  gregNum.className = 'greg-num';
  gregNum.textContent = day.gregDate.getDate();

  const hebDate = document.createElement('span');
  hebDate.className = 'heb-date';
  hebDate.textContent = day.hebLabel;

  dateRow.append(hebDate, gregNum);
  cell.appendChild(dateRow);

  // Event badges
  const visible = day.events.slice(0, MAX_BADGES);
  const hidden  = day.events.length - MAX_BADGES;

  for (const ev of visible) {
    const badge = document.createElement('span');
    badge.className = `ev-badge ev-${ev.type}`;
    badge.textContent = ev.heText;
    badge.title = ev.heText;
    cell.appendChild(badge);
  }

  if (hidden > 0) {
    const more = document.createElement('span');
    more.className = 'ev-more';
    more.textContent = `+${hidden} נוספים`;
    cell.appendChild(more);
  }

  // Same-combination occurrences
  if (!day.isOtherMonth && day.matches &&
      (day.matches.past.length > 0 || day.matches.future.length > 0)) {
    const section = document.createElement('div');
    section.className = 'matches-section';

    if (day.matches.past.length > 0) {
      const lbl = document.createElement('div');
      lbl.className = 'match-group-label';
      lbl.textContent = 'היה';
      section.appendChild(lbl);
      for (const m of day.matches.past) {
        const el = document.createElement('div');
        el.className = 'match-item match-past';
        el.textContent = m.label;
        section.appendChild(el);
      }
    }

    if (day.matches.past.length > 0 && day.matches.future.length > 0) {
      const sep = document.createElement('div');
      sep.className = 'match-sep';
      section.appendChild(sep);
    }

    if (day.matches.future.length > 0) {
      const lbl = document.createElement('div');
      lbl.className = 'match-group-label';
      lbl.textContent = 'יהיה';
      section.appendChild(lbl);
      for (const m of day.matches.future) {
        const el = document.createElement('div');
        el.className = 'match-item match-future';
        el.textContent = m.label;
        section.appendChild(el);
      }
    }

    cell.appendChild(section);
  }

  return cell;
}

/**
 * @param {HTMLElement} container
 * @param {{ days: import('./calendar.js').DayData[] }} monthData
 */
export function renderMonthView(container, monthData) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const wrapper = document.createElement('div');
  wrapper.className = 'month-view';

  // Day name headers
  const headers = document.createElement('div');
  headers.className = 'day-headers';
  for (const name of DAY_NAMES_HE) {
    const h = document.createElement('div');
    h.className = 'day-header-cell';
    h.textContent = name;
    headers.appendChild(h);
  }
  wrapper.appendChild(headers);

  // Day cells grid
  const grid = document.createElement('div');
  grid.className = 'month-grid';

  for (const day of monthData.days) {
    grid.appendChild(createDayCell(day, day.iso === todayIso));
  }

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}
