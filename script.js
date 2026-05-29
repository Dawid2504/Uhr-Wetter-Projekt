document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("clocks-container");
  const favContainer = document.getElementById("favorites-container");
  const favSection = document.getElementById("favorites-section");
  const allTitle = document.getElementById("all-title");
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-btn");
  const statusMessage = document.getElementById("status-message");
  const syncStatus = document.getElementById("sync-status");
  const overlay = document.getElementById("detail-overlay");
  const detailClose = document.getElementById("detail-close");
  const detailZone = document.getElementById("detail-zone");
  const detailTime = document.getElementById("detail-time");
  const detailDate = document.getElementById("detail-date");
  const detailOffset = document.getElementById("detail-offset");
  const detailStarBtn = document.getElementById("detail-star-btn");
  const weatherTemp = document.getElementById("weather-temp");
  const weatherDesc = document.getElementById("weather-desc");
  const weatherLoading = document.getElementById("weather-loading");
  const weatherInfo = document.getElementById("weather-info");
  const weatherError = document.getElementById("weather-error");
  const weatherIcon = document.getElementById("weather-icon");
  const forecastContainer = document.getElementById("forecast-container");
  const forecastScroll = document.getElementById("forecast-scroll");

  const searchCache = new Set();
  let timeOffset = 0;
  let searchTimeout = null;

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

  async function syncTime() {
    const startLocal = Date.now();
    try {
      const res = await fetch(
        "https://timeapi.io/api/time/current/zone?timeZone=UTC",
        { cache: "no-store" },
      );
      const data = await res.json();
      const endLocal = Date.now();
      const latency = (endLocal - startLocal) / 2;
      const serverTime = new Date(data.dateTime + "Z").getTime();
      timeOffset = serverTime - endLocal + latency;
      syncStatus.textContent =
        "✅ Zeit synchronisiert (±" + Math.round(latency) + " ms)";
      syncStatus.classList.add("ok");
    } catch (err) {
      syncStatus.textContent = "⚠️ Offline-Modus (lokale Zeit)";
      syncStatus.classList.add("error");
    }
  }

  function now() {
    return new Date(Date.now() + timeOffset);
  }

  syncTime();
  setInterval(syncTime, 60 * 60 * 1000);

  const cityDatabase = [
    {
      id: "berlin",
      name: "Berlin",
      country: "🇩🇪",
      timezone: "Europe/Berlin",
      lat: 52.52,
      lon: 13.4,
    },
    {
      id: "munich",
      name: "München",
      country: "🇩🇪",
      timezone: "Europe/Berlin",
      lat: 48.13,
      lon: 11.58,
    },
    {
      id: "hamburg",
      name: "Hamburg",
      country: "🇩🇪",
      timezone: "Europe/Berlin",
      lat: 53.55,
      lon: 9.99,
    },
    {
      id: "frankfurt",
      name: "Frankfurt",
      country: "🇩🇪",
      timezone: "Europe/Berlin",
      lat: 50.11,
      lon: 8.68,
    },
    {
      id: "london",
      name: "London",
      country: "🇬🇧",
      timezone: "Europe/London",
      lat: 51.51,
      lon: -0.13,
    },
    {
      id: "paris",
      name: "Paris",
      country: "🇫🇷",
      timezone: "Europe/Paris",
      lat: 48.86,
      lon: 2.35,
    },
    {
      id: "rome",
      name: "Rom",
      country: "🇮🇹",
      timezone: "Europe/Rome",
      lat: 41.9,
      lon: 12.5,
    },
    {
      id: "madrid",
      name: "Madrid",
      country: "🇪🇸",
      timezone: "Europe/Madrid",
      lat: 40.42,
      lon: -3.7,
    },
    {
      id: "amsterdam",
      name: "Amsterdam",
      country: "🇳🇱",
      timezone: "Europe/Amsterdam",
      lat: 52.37,
      lon: 4.9,
    },
    {
      id: "vienna",
      name: "Wien",
      country: "🇦🇹",
      timezone: "Europe/Vienna",
      lat: 48.21,
      lon: 16.37,
    },
    {
      id: "zurich",
      name: "Zürich",
      country: "🇨🇭",
      timezone: "Europe/Zurich",
      lat: 47.37,
      lon: 8.54,
    },
    {
      id: "moscow",
      name: "Moskau",
      country: "🇷🇺",
      timezone: "Europe/Moscow",
      lat: 55.75,
      lon: 37.62,
    },
    {
      id: "istanbul",
      name: "Istanbul",
      country: "🇹🇷",
      timezone: "Europe/Istanbul",
      lat: 41.01,
      lon: 28.98,
    },
    {
      id: "newyork",
      name: "New York",
      country: "🇺🇸",
      timezone: "America/New_York",
      lat: 40.71,
      lon: -74.01,
    },
    {
      id: "losangeles",
      name: "Los Angeles",
      country: "🇺🇸",
      timezone: "America/Los_Angeles",
      lat: 34.05,
      lon: -118.24,
    },
    {
      id: "chicago",
      name: "Chicago",
      country: "🇺🇸",
      timezone: "America/Chicago",
      lat: 41.88,
      lon: -87.63,
    },
    {
      id: "toronto",
      name: "Toronto",
      country: "🇨🇦",
      timezone: "America/Toronto",
      lat: 43.65,
      lon: -79.38,
    },
    {
      id: "mexicocity",
      name: "Mexiko-Stadt",
      country: "🇲🇽",
      timezone: "America/Mexico_City",
      lat: 19.43,
      lon: -99.13,
    },
    {
      id: "saopaulo",
      name: "São Paulo",
      country: "🇧🇷",
      timezone: "America/Sao_Paulo",
      lat: -23.55,
      lon: -46.63,
    },
    {
      id: "buenosaires",
      name: "Buenos Aires",
      country: "🇦🇷",
      timezone: "America/Argentina/Buenos_Aires",
      lat: -34.6,
      lon: -58.38,
    },
    {
      id: "tokyo",
      name: "Tokio",
      country: "🇯🇵",
      timezone: "Asia/Tokyo",
      lat: 35.68,
      lon: 139.69,
    },
    {
      id: "beijing",
      name: "Peking",
      country: "🇨🇳",
      timezone: "Asia/Shanghai",
      lat: 39.9,
      lon: 116.4,
    },
    {
      id: "shanghai",
      name: "Shanghai",
      country: "🇨🇳",
      timezone: "Asia/Shanghai",
      lat: 31.23,
      lon: 121.47,
    },
    {
      id: "hongkong",
      name: "Hong Kong",
      country: "🇭🇰",
      timezone: "Asia/Hong_Kong",
      lat: 22.32,
      lon: 114.17,
    },
    {
      id: "singapore",
      name: "Singapur",
      country: "🇸🇬",
      timezone: "Asia/Singapore",
      lat: 1.35,
      lon: 103.82,
    },
    {
      id: "seoul",
      name: "Seoul",
      country: "🇰🇷",
      timezone: "Asia/Seoul",
      lat: 37.57,
      lon: 126.98,
    },
    {
      id: "mumbai",
      name: "Mumbai",
      country: "🇮🇳",
      timezone: "Asia/Kolkata",
      lat: 19.08,
      lon: 72.88,
    },
    {
      id: "delhi",
      name: "Neu-Delhi",
      country: "🇮🇳",
      timezone: "Asia/Kolkata",
      lat: 28.61,
      lon: 77.21,
    },
    {
      id: "bangkok",
      name: "Bangkok",
      country: "🇹🇭",
      timezone: "Asia/Bangkok",
      lat: 13.75,
      lon: 100.5,
    },
    {
      id: "dubai",
      name: "Dubai",
      country: "🇦🇪",
      timezone: "Asia/Dubai",
      lat: 25.2,
      lon: 55.27,
    },
    {
      id: "sydney",
      name: "Sydney",
      country: "🇦🇺",
      timezone: "Australia/Sydney",
      lat: -33.87,
      lon: 151.21,
    },
    {
      id: "melbourne",
      name: "Melbourne",
      country: "🇦🇺",
      timezone: "Australia/Melbourne",
      lat: -37.81,
      lon: 144.96,
    },
    {
      id: "auckland",
      name: "Auckland",
      country: "🇳🇿",
      timezone: "Pacific/Auckland",
      lat: -36.85,
      lon: 174.76,
    },
    {
      id: "cairo",
      name: "Kairo",
      country: "🇪🇬",
      timezone: "Africa/Cairo",
      lat: 30.04,
      lon: 31.24,
    },
    {
      id: "capetown",
      name: "Kapstadt",
      country: "🇿🇦",
      timezone: "Africa/Johannesburg",
      lat: -33.93,
      lon: 18.42,
    },
    {
      id: "lagos",
      name: "Lagos",
      country: "🇳🇬",
      timezone: "Africa/Lagos",
      lat: 6.52,
      lon: 3.38,
    },
  ];

  const FAV_KEY = "weltinfos_favorites_v2";
  const favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));

  function saveFavorites() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
  }

  function toggleFavorite(cityId) {
    if (favorites.has(cityId)) favorites.delete(cityId);
    else favorites.add(cityId);
    saveFavorites();
    document
      .querySelectorAll('.star-btn[data-city-id="' + CSS.escape(cityId) + '"]')
      .forEach((b) => {
        b.classList.toggle("active", favorites.has(cityId));
        b.textContent = favorites.has(cityId) ? "★" : "☆";
      });
    if (activeCity && activeCity.id === cityId) updateDetailStar();
    applyFilter(searchInput.value);
  }

  const cityCards = {};
  let activeCity = null;

  function buildCard(city) {
    const card = document.createElement("div");
    card.className = "clock-card";
    card.style.display = "none";
    card.dataset.search = (city.name + " " + city.country).toLowerCase();
    card.dataset.cityId = city.id;

    const starBtn = document.createElement("button");
    starBtn.className = "star-btn";
    starBtn.dataset.cityId = city.id;
    starBtn.setAttribute("aria-label", "Als Favorit markieren");
    starBtn.textContent = favorites.has(city.id) ? "★" : "☆";
    if (favorites.has(city.id)) starBtn.classList.add("active");
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(city.id);
    });

    const zoneName = document.createElement("div");
    zoneName.className = "zone-name";
    zoneName.innerHTML =
      '<span class="city-flag">' + city.country + "</span> " + city.name;
    zoneName.title = city.timezone;

    const timeEl = document.createElement("div");
    timeEl.className = "time";
    timeEl.textContent = "--:--:--";

    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.textContent = "...";

    card.append(starBtn, zoneName, timeEl, dateEl);
    card.addEventListener("click", () => openDetail(city));

    return { city, card, timeEl, dateEl, starBtn };
  }

  cityDatabase.forEach((city) => {
    cityCards[city.id] = buildCard(city);
  });

  const fragment = document.createDocumentFragment();
  Object.values(cityCards).forEach((item) => fragment.appendChild(item.card));
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

  function applyFilter(query, skipAPISearch = false) {
    const term = query.toLowerCase().trim();
    container.innerHTML = "";
    favContainer.innerHTML = "";

    if (term === "") {
      if (favorites.size > 0) {
        favSection.style.display = "block";
        if (allTitle) allTitle.style.display = "none";
        Object.values(cityCards).forEach((item) => {
          if (favorites.has(item.city.id)) {
            favContainer.appendChild(item.card);
            item.card.style.display = "";
          } else {
            item.card.style.display = "none";
          }
        });
        statusMessage.textContent =
          "⭐ " +
          favorites.size +
          " Favorit" +
          (favorites.size === 1 ? "" : "en") +
          " – suche nach mehr.";
      } else {
        favSection.style.display = "none";
        if (allTitle) allTitle.style.display = "none";
        Object.values(cityCards).forEach(
          (item) => (item.card.style.display = "none"),
        );
        statusMessage.textContent = "Tippe etwas ein, um eine Stadt zu suchen.";
      }
      updateClocks();
      return;
    }

    const matches = Object.values(cityCards).filter((item) =>
      item.card.dataset.search.includes(term),
    );

    const favMatches = matches.filter((m) => favorites.has(m.city.id));
    const restMatches = matches.filter((m) => !favorites.has(m.city.id));

    favSection.style.display = "none";

    if (matches.length === 0) {
      if (allTitle) allTitle.style.display = "none";
      statusMessage.textContent =
        "Keine Städte lokal gefunden. Suche weltweit...";
    } else {
      if (allTitle) allTitle.style.display = "none";
      [...favMatches, ...restMatches].forEach((m) => {
        container.appendChild(m.card);
        m.card.style.display = "";
      });
      statusMessage.textContent =
        matches.length +
        " Städte gefunden" +
        (favMatches.length ? " (davon ⭐ " + favMatches.length + ")" : "") +
        ":";
    }

    Object.values(cityCards).forEach((item) => {
      if (!matches.includes(item)) item.card.style.display = "none";
    });

    updateClocks();

    if (!skipAPISearch && term.length >= 2 && !searchCache.has(term)) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => searchCityAPI(term), 600);
    }
  }

  async function searchCityAPI(query) {
    if (searchCache.has(query)) return;
    searchCache.add(query);
    try {
      statusMessage.textContent = "🔍 Suche '" + query + "' weltweit...";
      const res = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?name=" +
          encodeURIComponent(query) +
          "&count=5&language=de&format=json",
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        let newCitiesAdded = 0;
        data.results.forEach((result) => {
          const existingId = (
            result.name.toLowerCase() +
            "_" +
            (result.country_code || "x")
          ).replace(/[^a-z0-9]/g, "_");
          if (!cityCards[existingId]) {
            const newCity = {
              id: existingId,
              name: result.name,
              country: getFlagEmoji(result.country_code) || "🌍",
              timezone: result.timezone,
              lat: result.latitude,
              lon: result.longitude,
            };
            cityDatabase.push(newCity);
            cityCards[newCity.id] = buildCard(newCity);
            container.appendChild(cityCards[newCity.id].card);
            newCitiesAdded++;
          }
        });

        applyFilter(query, true);

        if (newCitiesAdded > 0) {
          statusMessage.textContent =
            "✅ " +
            newCitiesAdded +
            " neue Stadt" +
            (newCitiesAdded === 1 ? "" : "e") +
            " weltweit gefunden!";
        }
      } else {
        statusMessage.textContent =
          "Keine Städte weltweit für '" + query + "' gefunden.";
      }
    } catch (error) {
      console.warn("API-Suche fehlgeschlagen:", error);
      statusMessage.textContent = "⚠️ Online-Suche nicht möglich.";
    }
  }

  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  }

  const weatherCache = {};

  async function getWeatherForCity(city) {
    weatherLoading.style.display = "block";
    weatherInfo.style.display = "none";
    weatherError.style.display = "none";
    forecastContainer.style.display = "none";

    if (weatherCache[city.id]) {
      updateWeatherUI(weatherCache[city.id]);
      renderForecast(weatherCache[city.id].forecast);
      return;
    }

    try {
      const weatherUrl =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        city.lat +
        "&longitude=" +
        city.lon +
        "&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto";
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;
      const daily = weatherData.daily;

      const weather = {
        temp: Math.round(current.temperature),
        desc: WMO_CODES[current.weathercode] || "Unbekannt",
        icon: WMO_ICONS[current.weathercode] || "🌡️",
        location: city.name,
        forecast: daily.time.slice(0, 7).map((date, i) => ({
          day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
          icon: WMO_ICONS[daily.weathercode[i]] || "🌡️",
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        })),
      };
      weatherCache[city.id] = weather;
      updateWeatherUI(weather);
      renderForecast(weather.forecast);
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen:", error);
      weatherLoading.style.display = "none";
      weatherError.style.display = "block";
    }
  }

  function updateWeatherUI(w) {
    weatherLoading.style.display = "none";
    weatherInfo.style.display = "flex";
    weatherIcon.textContent = w.icon;
    weatherTemp.textContent = w.temp + "°C";
    weatherDesc.textContent = w.desc + " (" + w.location + ")";
  }

  function renderForecast(forecast) {
    forecastScroll.innerHTML = "";
    forecast.forEach((day) => {
      const el = document.createElement("div");
      el.className = "forecast-day";
      el.innerHTML =
        '<div class="forecast-day-name">' +
        day.day +
        '</div><div class="forecast-icon">' +
        day.icon +
        '</div><div class="forecast-temps"><span>' +
        day.max +
        "°</span><span>/ " +
        day.min +
        "°</span></div>";
      forecastScroll.appendChild(el);
    });
    forecastContainer.style.display = "block";
  }

  function updateClocks() {
    const t = now();
    for (const id in cityCards) {
      const item = cityCards[id];
      if (
        item.card.style.display === "none" &&
        (!activeCity || activeCity.id !== id)
      )
        continue;
      try {
        item.timeEl.textContent = t.toLocaleTimeString(
          "de-DE",
          Object.assign({}, timeOptions, { timeZone: item.city.timezone }),
        );
        item.dateEl.textContent = t.toLocaleDateString(
          "de-DE",
          Object.assign({}, dateOptions, { timeZone: item.city.timezone }),
        );
      } catch (e) {
        item.timeEl.textContent = "N/A";
      }
    }
    if (activeCity) {
      try {
        detailTime.textContent = t.toLocaleTimeString(
          "de-DE",
          Object.assign({}, timeOptions, { timeZone: activeCity.timezone }),
        );
        detailDate.textContent = t.toLocaleDateString(
          "de-DE",
          Object.assign({}, dateOptions, { timeZone: activeCity.timezone }),
        );
        const fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: activeCity.timezone,
          timeZoneName: "shortOffset",
        });
        const tzPart = fmt
          .formatToParts(t)
          .find((p) => p.type === "timeZoneName");
        if (tzPart)
          detailOffset.textContent = "UTC " + tzPart.value.replace("GMT", "");
      } catch (e) {
        detailTime.textContent = "N/A";
      }
    }
  }

  function openDetail(city) {
    activeCity = city;
    detailZone.textContent = city.country + " " + city.name;
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateDetailStar();
    updateClocks();
    getWeatherForCity(city);
  }

  function closeDetail() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeCity = null;
  }

  function updateDetailStar() {
    if (!activeCity) return;
    const isFav = favorites.has(activeCity.id);
    detailStarBtn.classList.toggle("active", isFav);
    detailStarBtn.textContent = isFav ? "★" : "☆";
  }

  detailStarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (activeCity) toggleFavorite(activeCity.id);
  });

  detailClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeDetail();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDetail();
  });

  function clearSearch() {
    searchInput.value = "";
    clearBtn.classList.remove("visible");
    applyFilter("");
    searchInput.focus();
  }

  searchInput.addEventListener("input", (e) => {
    clearBtn.classList.toggle("visible", e.target.value.length > 0);
    applyFilter(e.target.value);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchInput.blur();
    }
    if (e.key === "Escape") {
      activeCity ? closeDetail() : clearSearch();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeCity) closeDetail();
  });

  clearBtn.addEventListener("click", clearSearch);

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".search-wrapper") &&
      !e.target.closest(".detail-overlay")
    ) {
      searchInput.blur();
    }
  });

  applyFilter("");
  setInterval(updateClocks, 1000);
});
