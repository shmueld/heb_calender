const DAY_NAMES_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const MAX_BADGES = 3;

function createDayCell(day, isToday) {
  const cell = document.createElement('div');
  cell.className = 'day-cell';

  if (day.dayOfWeek === 6) cell.classList.add('col-shabbat');
  if (day.isOtherMonth)   cell.classList.add('day-other-month');
  if (isToday)            cell.classList.add('day-today');

  const dateRow = document.createElement('div');
  dateRow.className = 'day-date-row';

  const hebDate = document.createElement('span');
  hebDate.className = 'heb-date';
  hebDate.textContent = day.hebLabel;

  const gregNum = document.createElement('span');
  gregNum.className = 'greg-num';
  gregNum.textContent = day.gregDate.getDate();

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

  // Same-combination matches (desktop — shown inline)
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

// Populate the mobile detail panel with a day's match data
function populateDetailPanel(panel, day, onClose) {
  panel.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'detail-header';

  const title = document.createElement('span');
  title.className = 'detail-title';
  const dd   = String(day.gregDate.getDate()).padStart(2, '0');
  const mm   = String(day.gregDate.getMonth() + 1).padStart(2, '0');
  const yyyy = day.gregDate.getFullYear();
  title.textContent = `${day.hebLabel}  ·  ${dd}/${mm}/${yyyy}`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close';
  closeBtn.setAttribute('aria-label', 'סגור');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', e => { e.stopPropagation(); onClose(); });

  header.append(title, closeBtn);
  panel.appendChild(header);

  const { past = [], future = [] } = day.matches || {};

  if (past.length === 0 && future.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'detail-empty';
    empty.textContent = 'לא נמצאו מופעים תואמים ב-100 השנים הסמוכות';
    panel.appendChild(empty);
    return;
  }

  if (past.length > 0) {
    const lbl = document.createElement('div');
    lbl.className = 'detail-group-label';
    lbl.textContent = 'היה';
    panel.appendChild(lbl);
    for (const m of past) {
      const el = document.createElement('div');
      el.className = 'detail-match detail-past';
      el.textContent = m.label;
      panel.appendChild(el);
    }
  }

  if (past.length > 0 && future.length > 0) {
    const sep = document.createElement('div');
    sep.className = 'detail-sep';
    panel.appendChild(sep);
  }

  if (future.length > 0) {
    const lbl = document.createElement('div');
    lbl.className = 'detail-group-label';
    lbl.textContent = 'יהיה';
    panel.appendChild(lbl);
    for (const m of future) {
      const el = document.createElement('div');
      el.className = 'detail-match detail-future';
      el.textContent = m.label;
      panel.appendChild(el);
    }
  }
}

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

  // Detail panel (mobile — rendered below the grid)
  const detailPanel = document.createElement('div');
  detailPanel.className = 'day-detail-panel';
  detailPanel.hidden = true;

  let activeCell = null;

  function closeDetail() {
    if (activeCell) { activeCell.classList.remove('day-selected'); activeCell = null; }
    detailPanel.hidden = true;
  }

  // Day cells grid
  const grid = document.createElement('div');
  grid.className = 'month-grid';

  for (const day of monthData.days) {
    const cell = createDayCell(day, day.iso === todayIso);

    if (!day.isOtherMonth) {
      cell.addEventListener('click', () => {
        if (activeCell === cell) { closeDetail(); return; }
        if (activeCell) activeCell.classList.remove('day-selected');
        activeCell = cell;
        cell.classList.add('day-selected');
        populateDetailPanel(detailPanel, day, closeDetail);
        detailPanel.hidden = false;
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    grid.appendChild(cell);
  }

  wrapper.appendChild(grid);
  wrapper.appendChild(detailPanel);
  container.appendChild(wrapper);
}
