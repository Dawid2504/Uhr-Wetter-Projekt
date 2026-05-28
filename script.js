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

  // Wetter-Elemente
  const weatherTemp = document.getElementById('weather-temp');
  const weatherDesc = document.getElementById('weather-desc');
  const weatherLoading = document.getElementById('weather-loading');
  const weatherInfo = document.getElementById('weather-info');
  const weatherError = document.getElementById('weather-error');

  // Cache & WMO-Codes (Open-Meteo Weather Codes)
  const weatherCache = {};
  const WMO_CODES = {
    0: 'Klar', 1: 'Überwiegend klar', 2: 'Teilweise bewölkt', 3: 'Bewölkt',
    45: 'Nebel', 48: 'Rauchnebel',
    51: 'Leichter Nieselregen', 53: 'Mäßiger Nieselregen', 55: 'Starker Nieselregen',
    61: 'Leichter Regen', 63: 'Mäßiger Regen', 65: 'Starker Regen',
    71: 'Leichter Schneefall', 73: 'Mäßiger Schneefall', 75: 'Starker Schneefall',
    80: 'Leichte Schauer', 81: 'Mäßige Schauer', 82: 'Starke Schauer',
    95: 'Gewitter', 96: 'Gewitter mit Hagel', 99: 'Schweres Gewitter'
  };

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

  async function getWeatherForZone(zone) {
  // UI zurücksetzen
  weatherLoading.style.display = 'block';
  weatherInfo.style.display = 'none';
  weatherError.style.display = 'none';

  // Cache prüfen
  if (weatherCache[zone]) {
    updateWeatherUI(weatherCache[zone]);
    return;
  }

  try {
    // 1. Ortsname aus Timezone extrahieren (z.B. "Europe/Berlin" -> "Berlin")
    const locationName = zone.split('/').pop().replace(/_/g, ' ');

    // 2. Koordinaten holen
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=de&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results?.length) throw new Error('Standort nicht gefunden');
    const { latitude, longitude, name } = geoData.results[0];

    // 3. Wetterdaten holen
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
    const weatherData = await weatherRes.json();

    const weather = {
      temp: Math.round(weatherData.current_weather.temperature),
      desc: WMO_CODES[weatherData.current_weather.weathercode] || 'Unbekannt',
      location: name
    };

    weatherCache[zone] = weather; // Speichern für spätere Aufrufe
    updateWeatherUI(weather);

  } catch (error) {
    console.warn(`⚠️ Wetter für ${zone} fehlgeschlagen:`, error);
    weatherLoading.style.display = 'none';
    weatherError.style.display = 'block';
  }
}

  function updateWeatherUI(weather) {
    weatherLoading.style.display = 'none';
    weatherInfo.style.display = 'flex';
    weatherTemp.textContent = `${weather.temp}°C`;
    weatherDesc.textContent = `${weather.desc} (${weather.location})`;
  }
  
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
    getWeatherForZone(zone);
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