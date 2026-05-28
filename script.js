document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('clocks-container');
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-btn');
  const showAllBtn = document.getElementById('show-all-btn');
  const statusMessage = document.getElementById('status-message');

  // Detail-Overlay Elemente
  const overlay = document.getElementById('detail-overlay');
  const detailClose = document.getElementById('detail-close');
  const detailZone = document.getElementById('detail-zone');
  const detailTime = document.getElementById('detail-time');
  const detailDate = document.getElementById('detail-date');
  const detailOffset = document.getElementById('detail-offset');

  const allZones = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : ['Europe/Berlin', 'America/New_York', 'Asia/Tokyo', 'UTC'];
  console.log(`✅ ${allZones.length} Zeitzonen geladen`);

  const zoneCards = [];
  let activeZone = null;

  const fragment = document.createDocumentFragment();
  allZones.forEach(zone => {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.style.display = 'none';
    const searchText = zone.replace(/_/g, ' ').toLowerCase();
    card.dataset.search = searchText;

    const zoneName = document.createElement('div');
    zoneName.className = 'zone-name';
    zoneName.textContent = zone.replace(/_/g, ' ');
    zoneName.title = zone;

    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    timeEl.textContent = '--:--:--';

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = '...';

    card.append(zoneName, timeEl, dateEl);
    fragment.appendChild(card);
    zoneCards.push({ zone, card, timeEl, dateEl });

    // Klick öffnet Vollbild-Ansicht
    card.addEventListener('click', () => openDetail(zone));
  });
  container.appendChild(fragment);

  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  function updateClocks() {
    const now = new Date();
    for (const item of zoneCards) {
      if (item.card.style.display !== 'none') {
        try {
          item.timeEl.textContent = now.toLocaleTimeString('de-DE', { ...timeOptions, timeZone: item.zone });
          item.dateEl.textContent = now.toLocaleDateString('de-DE', { ...dateOptions, timeZone: item.zone });
        } catch (e) {
          item.timeEl.textContent = 'N/A';
        }
      }
    }

    // Detail-Uhr aktualisieren
    if (activeZone) {
      try {
        detailTime.textContent = now.toLocaleTimeString('de-DE', { ...timeOptions, timeZone: activeZone });
        detailDate.textContent = now.toLocaleDateString('de-DE', { ...dateOptions, timeZone: activeZone });

        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: activeZone, timeZoneName: 'shortOffset'
        });
        const parts = formatter.formatToParts(now);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart) detailOffset.textContent = `UTC ${tzPart.value.replace('GMT', '')}`;
      } catch (e) {
        detailTime.textContent = 'N/A';
      }
    }
  }

  function openDetail(zone) {
    activeZone = zone;
    detailZone.textContent = zone.replace(/_/g, ' ');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateClocks();
  }

  function closeDetail() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeZone = null;
  }

  detailClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDetail();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetail();
  });

  function applyFilter(query, showAllIfEmpty = false) {
    const term = query.toLowerCase().trim();
    let visibleCount = 0;
    zoneCards.forEach(item => {
      let show;
      if (term === '') {
        show = showAllIfEmpty;
      } else {
        show = item.card.dataset.search.includes(term);
      }
      item.card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (term === '' && !showAllIfEmpty) {
      statusMessage.innerHTML = 'Tippe etwas ein oder klicke auf "Alle anzeigen".';
    } else if (visibleCount === 0) {
      statusMessage.textContent = `Keine Zeitzonen für "${query}" gefunden.`;
    } else {
      statusMessage.textContent = `${visibleCount} Zeitzonen gefunden:`;
    }
    updateClocks();
  }

  function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    applyFilter('', false);
    searchInput.focus();
  }

  searchInput.addEventListener('input', (e) => {
    clearBtn.classList.toggle('visible', e.target.value.length > 0);
    applyFilter(e.target.value, false);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchInput.blur(); }
    if (e.key === 'Escape') {
      if (activeZone) closeDetail();
      else clearSearch();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeZone) closeDetail();
  });

  clearBtn.addEventListener('click', clearSearch);
  showAllBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    applyFilter('', true);
    searchInput.blur();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper') && !e.target.closest('.detail-overlay')) {
      searchInput.blur();
    }
  });

  applyFilter('', false);
  setInterval(updateClocks, 1000);
});