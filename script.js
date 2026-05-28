document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("clocks-container");
  const favContainer = document.getElementById("favorites-container");
  const favSection = document.getElementById("favorites-section");
  const allTitle = document.getElementById("all-title");
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-btn");
  const showAllBtn = document.getElementById("show-all-btn");
  const statusMessage = document.getElementById("status-message");
  const syncStatus = document.getElementById("sync-status");

  // Detail-Overlay
  const overlay = document.getElementById("detail-overlay");
  const detailClose = document.getElementById("detail-close");
  const detailZone = document.getElementById("detail-zone");
  const detailTime = document.getElementById("detail-time");
  const detailDate = document.getElementById("detail-date");
  const detailOffset = document.getElementById("detail-offset");

  // Wetter
  const weatherTemp = document.getElementById("weather-temp");
  const weatherDesc = document.getElementById("weather-desc");
  const weatherLoading = document.getElementById("weather-loading");
  const weatherInfo = document.getElementById("weather-info");
  const weatherError = document.getElementById("weather-error");
  const weatherIcon = document.getElementById("weather-icon");
  const forecastContainer = document.getElementById("forecast-container");
  const forecastScroll = document.getElementById("forecast-scroll");

  const WMO_ICONS = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌦️",
    55: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "❄️",
    80: "🌦️",
    81: "🌧️",
    82: "⛈️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };
  const WMO_CODES = {
    0: "Klar",
    1: "Überwiegend klar",
    2: "Teilweise bewölkt",
    3: "Bewölkt",
    45: "Nebel",
    48: "Rauchnebel",
    51: "Leichter Nieselregen",
    53: "Mäßiger Nieselregen",
    55: "Starker Nieselregen",
    61: "Leichter Regen",
    63: "Mäßiger Regen",
    65: "Starker Regen",
    71: "Leichter Schneefall",
    73: "Mäßiger Schneefall",
    75: "Starker Schneefall",
    80: "Leichte Schauer",
    81: "Mäßige Schauer",
    82: "Starke Schauer",
    95: "Gewitter",
    96: "Gewitter mit Hagel",
    99: "Schweres Gewitter",
  };

  /* =========================================================
     🕐 ZEIT-SYNCHRONISATION (Offset zur lokalen Uhr)
     ========================================================= */
  let timeOffset = 0; // ms Unterschied Server ↔ Lokal
  let timeSynced = false;

  async function syncTime() {
    const startLocal = Date.now();
    try {
      // timeapi.io liefert UTC, CORS-freundlich, kein API-Key nötig
      const res = await fetch(
        "https://timeapi.io/api/time/current/zone?timeZone=UTC",
        { cache: "no-store" },
      );
      const data = await res.json();
      const endLocal = Date.now();
      const latency = (endLocal - startLocal) / 2; // grobe Schätzung
      // data.dateTime ist ISO-String, z. B. "2026-05-28T12:34:56.789"
      const serverTime = new Date(data.dateTime + "Z").getTime();
      timeOffset = serverTime - endLocal + latency;
      timeSynced = true;
      syncStatus.textContent = `✅ Zeit synchronisiert (±${Math.round(latency)} ms)`;
      syncStatus.classList.add("ok");
    } catch (err) {
      console.warn("⚠️ Zeit-Sync fehlgeschlagen, nutze lokale Zeit:", err);
      syncStatus.textContent = "⚠️ Offline-Modus (lokale Zeit)";
      syncStatus.classList.add("error");
    }
  }
  function now() {
    return new Date(Date.now() + timeOffset);
  }

  // Einmal pro Stunde neu synchronisieren
  syncTime();
  setInterval(syncTime, 60 * 60 * 1000);

  /* =========================================================
     ⭐ FAVORITEN (localStorage)
     ========================================================= */
  const FAV_KEY = "weltinfos_favorites";
  const favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));

  function saveFavorites() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
  }
  function toggleFavorite(zone, starBtn) {
    if (favorites.has(zone)) favorites.delete(zone);
    else favorites.add(zone);
    saveFavorites();
    // Alle Stern-Buttons für diese Zone aktualisieren
    document
      .querySelectorAll(`.star-btn[data-zone="${CSS.escape(zone)}"]`)
      .forEach((b) => {
        b.classList.toggle("active", favorites.has(zone));
        b.textContent = favorites.has(zone) ? "★" : "☆";
      });
    applyFilter(searchInput.value, currentShowAll);
  }

  /* =========================================================
     🌍 ZONEN LADEN & KARTEN BAUEN
     ========================================================= */
  const allZones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : ["Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"];
  console.log(`✅ ${allZones.length} Zeitzonen geladen`);

  const zoneCards = {}; // zone -> {zone, card, timeEl, dateEl, starBtn}
  let activeZone = null;
  let currentShowAll = false;

  function buildCard(zone) {
    const card = document.createElement("div");
    card.className = "clock-card";
    card.style.display = "none";

    const searchText = zone.replace(/_/g, " ").toLowerCase();
    card.dataset.search = searchText;
    card.dataset.zone = zone;

    const starBtn = document.createElement("button");
    starBtn.className = "star-btn";
    starBtn.dataset.zone = zone;
    starBtn.setAttribute("aria-label", "Als Favorit markieren");
    starBtn.textContent = favorites.has(zone) ? "★" : "☆";
    if (favorites.has(zone)) starBtn.classList.add("active");
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(zone, starBtn);
    });

    const zoneName = document.createElement("div");
    zoneName.className = "zone-name";
    zoneName.textContent = zone.replace(/_/g, " ");
    zoneName.title = zone;

    const timeEl = document.createElement("div");
    timeEl.className = "time";
    timeEl.textContent = "--:--:--";

    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.textContent = "...";

    card.append(starBtn, zoneName, timeEl, dateEl);
    card.addEventListener("click", () => openDetail(zone));

    return { zone, card, timeEl, dateEl, starBtn };
  }

  // Karten erzeugen und im "Pool" (clocks-container) versteckt halten
  const fragment = document.createDocumentFragment();
  allZones.forEach((zone) => {
    const item = buildCard(zone);
    zoneCards[zone] = item;
    fragment.appendChild(item.card);
  });
  container.appendChild(fragment);

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  /* =========================================================
     🔎 FILTER + FAVORITEN-ANZEIGE
     ========================================================= */
  function applyFilter(query, showAllIfEmpty = false) {
    currentShowAll = showAllIfEmpty;
    const term = query.toLowerCase().trim();

    // 1) container leeren (Karten bleiben im DOM, werden nur verschoben)
    container.innerHTML = "";
    favContainer.innerHTML = "";

    let matches = [];
    allZones.forEach((zone) => {
      const item = zoneCards[zone];
      const isMatch =
        term === "" ? showAllIfEmpty : item.card.dataset.search.includes(term);
      if (isMatch) matches.push(item);
    });

    // 2) Favoriten unter den Treffern nach oben
    const favMatches = matches.filter((m) => favorites.has(m.zone));
    const restMatches = matches.filter((m) => !favorites.has(m.zone));

    // 3) Favoriten-Sektion nur zeigen, wenn leer + Favoriten existieren
    if (term === "" && !showAllIfEmpty && favorites.size > 0) {
      favSection.style.display = "block";
      allTitle.style.display = "none";
      favMatches.forEach((m) => favContainer.appendChild(m.card));
      favMatches.forEach((m) => (m.card.style.display = ""));
      restMatches.forEach((m) => (m.card.style.display = "none"));
      statusMessage.textContent = `⭐ ${favMatches.length} Favorit${favMatches.length === 1 ? "" : "en"} – suche nach mehr oder klicke "Alle anzeigen".`;
    } else if (matches.length === 0) {
      favSection.style.display = "none";
      allTitle.style.display = "none";
      statusMessage.textContent = term
        ? `Keine Zeitzonen für "${query}" gefunden.`
        : 'Tippe etwas ein oder klicke auf "Alle anzeigen".';
    } else {
      // Bei Suche / "Alle anzeigen": alles in einer Liste, Favoriten zuerst
      favSection.style.display = "none";
      allTitle.style.display = term === "" && showAllIfEmpty ? "block" : "none";
      [...favMatches, ...restMatches].forEach((m) => {
        container.appendChild(m.card);
        m.card.style.display = "";
      });
      statusMessage.textContent = term
        ? `${matches.length} Zeitzonen gefunden${favMatches.length ? ` (davon ⭐ ${favMatches.length})` : ""}:`
        : `Alle ${matches.length} Zeitzonen:`;
    }
    updateClocks();
  }

  /* =========================================================
     🌤️ WETTER (unverändert, nur Formatierung)
     ========================================================= */
  const weatherCache = {};
  async function getWeatherForZone(zone) {
    weatherLoading.style.display = "block";
    weatherInfo.style.display = "none";
    weatherError.style.display = "none";
    forecastContainer.style.display = "none";
    if (weatherCache[zone]) {
      updateWeatherUI(weatherCache[zone]);
      renderForecast(weatherCache[zone].forecast);
      return;
    }
    try {
      const locationName = zone.split("/").pop().replace(/_/g, " ");
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=de&format=json`,
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("Standort nicht gefunden");
      const { latitude, longitude, name } = geoData.results[0];

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;
      const daily = weatherData.daily;

      const weather = {
        temp: Math.round(current.temperature),
        desc: WMO_CODES[current.weathercode] || "Unbekannt",
        icon: WMO_ICONS[current.weathercode] || "🌡️",
        location: name,
        forecast: daily.time.slice(0, 7).map((date, i) => ({
          day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
          icon: WMO_ICONS[daily.weathercode[i]] || "🌡️",
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        })),
      };
      weatherCache[zone] = weather;
      updateWeatherUI(weather);
      renderForecast(weather.forecast);
    } catch (error) {
      console.warn(`⚠️ Wetter für ${zone} fehlgeschlagen:`, error);
      weatherLoading.style.display = "none";
      weatherError.style.display = "block";
    }
  }
  function updateWeatherUI(w) {
    weatherLoading.style.display = "none";
    weatherInfo.style.display = "flex";
    weatherIcon.textContent = w.icon;
    weatherTemp.textContent = `${w.temp}°C`;
    weatherDesc.textContent = `${w.desc} (${w.location})`;
  }
  function renderForecast(forecast) {
    forecastScroll.innerHTML = "";
    forecast.forEach((day) => {
      const el = document.createElement("div");
      el.className = "forecast-day";
      el.innerHTML = `
        <div class="forecast-day-name">${day.day}</div>
        <div class="forecast-icon">${day.icon}</div>
        <div class="forecast-temps">
          <span>${day.max}°</span><span>/ ${day.min}°</span>
        </div>`;
      forecastScroll.appendChild(el);
    });
    forecastContainer.style.display = "block";
  }

  /* =========================================================
     ⏰ UHR-AKTUALISIERUNG (nutzt now() mit Offset!)
     ========================================================= */
  function updateClocks() {
    const t = now();
    // Nur sichtbare Karten updaten
    for (const zone in zoneCards) {
      const item = zoneCards[zone];
      if (item.card.style.display === "none" && item.zone !== activeZone)
        continue;
      try {
        item.timeEl.textContent = t.toLocaleTimeString("de-DE", {
          ...timeOptions,
          timeZone: item.zone,
        });
        item.dateEl.textContent = t.toLocaleDateString("de-DE", {
          ...dateOptions,
          timeZone: item.zone,
        });
      } catch {
        item.timeEl.textContent = "N/A";
      }
    }
    if (activeZone) {
      try {
        detailTime.textContent = t.toLocaleTimeString("de-DE", {
          ...timeOptions,
          timeZone: activeZone,
        });
        detailDate.textContent = t.toLocaleDateString("de-DE", {
          ...dateOptions,
          timeZone: activeZone,
        });
        const fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: activeZone,
          timeZoneName: "shortOffset",
        });
        const tzPart = fmt
          .formatToParts(t)
          .find((p) => p.type === "timeZoneName");
        if (tzPart)
          detailOffset.textContent = `UTC ${tzPart.value.replace("GMT", "")}`;
      } catch {
        detailTime.textContent = "N/A";
      }
    }
  }

  /* =========================================================
     🖼️ DETAIL-OVERLAY
     ========================================================= */
  function openDetail(zone) {
    activeZone = zone;
    detailZone.textContent = zone.replace(/_/g, " ");
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateClocks();
    getWeatherForZone(zone);
  }
  function closeDetail() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeZone = null;
  }
  detailClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeDetail();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDetail();
  });

  /* =========================================================
     🧹 SEARCH-UI
     ========================================================= */
  function clearSearch() {
    searchInput.value = "";
    clearBtn.classList.remove("visible");
    applyFilter("", false);
    searchInput.focus();
  }
  searchInput.addEventListener("input", (e) => {
    clearBtn.classList.toggle("visible", e.target.value.length > 0);
    applyFilter(e.target.value, false);
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchInput.blur();
    }
    if (e.key === "Escape") {
      activeZone ? closeDetail() : clearSearch();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeZone) closeDetail();
  });
  clearBtn.addEventListener("click", clearSearch);
  showAllBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.remove("visible");
    applyFilter("", true);
    searchInput.blur();
  });
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".search-wrapper") &&
      !e.target.closest(".detail-overlay")
    ) {
      searchInput.blur();
    }
  });

  /* =========================================================
     🚀 START
     ========================================================= */
  applyFilter("", false);
  setInterval(updateClocks, 1000);
});
