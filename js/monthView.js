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
  const hasOtherMatches = !day.isOtherMonth && day.matches &&
    day.matches.some(m => !m.isCurrent);
  if (hasOtherMatches) {
    const section = document.createElement('div');
    section.className = 'matches-section';

    for (const m of day.matches) {
      const el = document.createElement('div');
      el.className = m.isCurrent  ? 'match-item match-current'
                   : m.isPast     ? 'match-item match-past'
                                  : 'match-item match-future';
      el.textContent = m.label;
      section.appendChild(el);
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

  const matches = day.matches || [];
  const hasOther = matches.some(m => !m.isCurrent);

  if (!hasOther) {
    const empty = document.createElement('div');
    empty.className = 'detail-empty';
    empty.textContent = 'לא נמצאו מופעים תואמים ב-100 השנים הסמוכות';
    panel.appendChild(empty);
    return;
  }

  for (const m of matches) {
    const el = document.createElement('div');
    el.className = m.isCurrent ? 'detail-match detail-current'
                 : m.isPast    ? 'detail-match detail-past'
                               : 'detail-match detail-future';
    el.textContent = m.label;
    panel.appendChild(el);
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
