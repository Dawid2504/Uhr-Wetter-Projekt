document.addEventListener("DOMContentLoaded", () => {
  // --- ANPASSUNG 1: WETTER-SYMBOLE ENTFERNEN & SUCHLEISTE IN DEN STARTSCREEN SETZEN ---
  const searchWrapper = document.querySelector(".search-wrapper");
  const weatherOverview = document.querySelector(".welcome-weather-overview");
  if (searchWrapper && weatherOverview) {
    weatherOverview.innerHTML = ""; // Löscht Sonnig, Regen, Bewölkt
    weatherOverview.appendChild(searchWrapper); // Setzt die Suchleiste an diese Stelle
  }

  const container = document.getElementById("clocks-container");
  const favContainer = document.getElementById("favorites-container");
  const favSection = document.getElementById("favorites-section");
  const allTitle = document.getElementById("all-title");
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-btn");
  const statusMessage = document.getElementById("status-message");
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
  const welcomeHero = document.getElementById("welcome-hero");
  const quickCities = document.getElementById("quick-cities");
  const hourlyContainer = document.getElementById("hourly-container");
  const hourlyScroll = document.getElementById("hourly-scroll");
  const hourlyTitle = document.getElementById("hourly-title");
  const statSunny = document.getElementById("stat-sunny");
  const statRain = document.getElementById("stat-rain");
  const statCloudy = document.getElementById("stat-cloudy");

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

  const WEATHER_BACKGROUNDS = {
    clear: "images/bg-clear.png",
    cloudy: "images/bg-cloudy.png",
    fog: "images/bg-fog.png",
    rain: "images/bg-rain.png",
    snow: "images/bg-snow.png",
    thunder: "images/bg-thunder.png",
  };

  function getWeatherBackground(code) {
    if ([0, 1].includes(code)) return WEATHER_BACKGROUNDS.clear;
    if ([2, 3].includes(code)) return WEATHER_BACKGROUNDS.cloudy;
    if ([45, 48].includes(code)) return WEATHER_BACKGROUNDS.fog;
    if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code))
      return WEATHER_BACKGROUNDS.rain;
    if ([71, 73, 75].includes(code)) return WEATHER_BACKGROUNDS.snow;
    if ([82, 95, 96, 99].includes(code)) return WEATHER_BACKGROUNDS.thunder;
    return WEATHER_BACKGROUNDS.clear;
    document.addEventListener("DOMContentLoaded", () => {
      // --- ANPASSUNG 1: WETTER-SYMBOLE ENTFERNEN & SUCHLEISTE IN DEN STARTSCREEN SETZEN ---
      const searchWrapper = document.querySelector(".search-wrapper");
      const weatherOverview = document.querySelector(
        ".welcome-weather-overview",
      );
      if (searchWrapper && weatherOverview) {
        weatherOverview.innerHTML = ""; // Löscht Sonnig, Regen, Bewölkt
        weatherOverview.appendChild(searchWrapper); // Setzt die Suchleiste an diese Stelle
      }

      const container = document.getElementById("clocks-container");
      const favContainer = document.getElementById("favorites-container");
      const favSection = document.getElementById("favorites-section");
      const allTitle = document.getElementById("all-title");
      const searchInput = document.getElementById("search-input");
      const clearBtn = document.getElementById("clear-btn");
      const statusMessage = document.getElementById("status-message");
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
      const welcomeHero = document.getElementById("welcome-hero");
      const quickCities = document.getElementById("quick-cities");
      const hourlyContainer = document.getElementById("hourly-container");
      const hourlyScroll = document.getElementById("hourly-scroll");
      const hourlyTitle = document.getElementById("hourly-title");
      const statSunny = document.getElementById("stat-sunny");
      const statRain = document.getElementById("stat-rain");
      const statCloudy = document.getElementById("stat-cloudy");

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

      const WEATHER_BACKGROUNDS = {
        clear: "bg-clear.png",
        cloudy: "bg-cloudy.png",
        fog: "bg-fog.png",
        rain: "bg-rain.png",
        snow: "bg-snow.png",
        thunder: "bg-thunder.png",
      };

      function getWeatherBackground(code) {
        if ([0, 1].includes(code)) return WEATHER_BACKGROUNDS.clear;
        if ([2, 3].includes(code)) return WEATHER_BACKGROUNDS.cloudy;
        if ([45, 48].includes(code)) return WEATHER_BACKGROUNDS.fog;
        if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code))
          return WEATHER_BACKGROUNDS.rain;
        if ([71, 73, 75].includes(code)) return WEATHER_BACKGROUNDS.snow;
        if ([82, 95, 96, 99].includes(code)) return WEATHER_BACKGROUNDS.thunder;
        return WEATHER_BACKGROUNDS.clear;
      }

      function applyDetailBackground(code) {
        const bgUrl = getWeatherBackground(code);
        const isLight = document.body.classList.contains("light-mode");

        // ✅ Gradient anpassen: Dunkel für Dark Mode, Hell für Light Mode
        const overlayGradient = isLight
          ? "linear-gradient(rgba(244, 244, 244, 0.75), rgba(244, 244, 244, 0.9))"
          : "linear-gradient(rgba(18, 18, 18, 0.6), rgba(18, 18, 18, 0.8))";

        // ⚠️ Falls du die Bilder bereits in den "images/" Ordner verschoben hast:
        // Nutze: url('images/${bgUrl}')
        // Sonst: url('${bgUrl}')
        overlay.style.backgroundImage = `${overlayGradient}, url('${bgUrl}')`;
        overlay.style.backgroundSize = "cover";
        overlay.style.backgroundPosition = "center";

        // ✅ Textfarbe im Detail explizit setzen, damit sie immer lesbar bleibt
        const detailContent = document.querySelector(".detail-content");
        if (detailContent) {
          detailContent.style.color = isLight ? "#111" : "#fff";
        }
      }

      async function syncTime() {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(
            "https://timeapi.io/api/time/current/zone?timeZone=UTC",
            {
              cache: "no-store",
              signal: controller.signal,
            },
          );
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error("API antwortet nicht");
          const data = await res.json();
          const serverTime = new Date(data.dateTime + "Z").getTime();
          timeOffset = serverTime - Date.now();
        } catch (err) {
          console.warn("Zeit-Sync fehlgeschlagen, verwende lokale Zeit:", err);
          timeOffset = 0;
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
      const favorites = new Set(
        JSON.parse(localStorage.getItem(FAV_KEY) || "[]"),
      );

      function saveFavorites() {
        localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
      }

      function toggleFavorite(cityId) {
        if (favorites.has(cityId)) favorites.delete(cityId);
        else favorites.add(cityId);
        saveFavorites();
        document
          .querySelectorAll(
            '.star-btn[data-city-id="' + CSS.escape(cityId) + '"]',
          )
          .forEach((b) => {
            b.classList.toggle("active", favorites.has(cityId));
            b.textContent = favorites.has(cityId) ? "★" : "☆";
          });
        if (activeCity && activeCity.id === cityId) updateDetailStar();
        applyFilter(searchInput.value);
      }

      const cityCards = {};
      let activeCity = null;
      const weatherCache = {};

      function buildCard(city) {
        const card = document.createElement("div");
        card.className = "clock-card";
        card.style.display = "none";
        card.dataset.search = (city.name + " " + city.country).toLowerCase();
        card.dataset.cityId = city.id;

        const starBtn = document.createElement("button");
        starBtn.className = "star-btn";
        starBtn.dataset.cityId = city.id;
        starBtn.textContent = favorites.has(city.id) ? "★" : "☆";
        if (favorites.has(city.id)) starBtn.classList.add("active");
        starBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavorite(city.id);
        });

        const zoneName = document.createElement("div");
        zoneName.className = "zone-name";
        zoneName.innerHTML = `<span class="city-flag">${city.country}</span>${city.name}`;

        const timeEl = document.createElement("div");
        timeEl.className = "time";
        timeEl.textContent = "--:--:--";

        const dateEl = document.createElement("div");
        dateEl.className = "date";
        dateEl.textContent = "...";

        const weatherEl = document.createElement("div");
        weatherEl.className = "card-weather";
        weatherEl.innerHTML = `
      <div class="card-weather-icon">🌡️</div>
      <div class="card-weather-info">
        <div class="card-weather-temp">--°C</div>
        <div class="card-weather-desc">Lädt...</div>
      </div>
    `;

        const forecastEl = document.createElement("div");
        forecastEl.className = "card-forecast";
        forecastEl.innerHTML = `
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
    `;

        card.append(starBtn, zoneName, timeEl, dateEl, weatherEl, forecastEl);
        card.addEventListener("click", () => openDetail(city));

        return { city, card, timeEl, dateEl, starBtn, weatherEl, forecastEl };
      }

      cityDatabase.forEach((city) => {
        cityCards[city.id] = buildCard(city);
      });

      const fragment = document.createDocumentFragment();
      Object.values(cityCards).forEach((item) =>
        fragment.appendChild(item.card),
      );
      container.appendChild(fragment);

      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const dateOptions = {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      };

      function buildQuickAccess() {
        const popularCities = [
          "berlin",
          "london",
          "newyork",
          "tokyo",
          "sydney",
          "dubai",
        ];
        quickCities.innerHTML = "";
        popularCities.forEach((cityId) => {
          const city = cityCards[cityId];
          if (city) {
            const btn = document.createElement("button");
            btn.className = "quick-city-btn";
            btn.textContent = city.city.country + " " + city.city.name;
            btn.addEventListener("click", () => openDetail(city.city));
            quickCities.appendChild(btn);
          }
        });
      }

      async function loadCardWeather(city) {
        const cardData = cityCards[city.id];
        if (!cardData) return;
        if (weatherCache[city.id]) {
          updateCardWeatherUI(city.id, weatherCache[city.id]);
          return;
        }
        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weathercode&timezone=auto`;
          const weatherRes = await fetch(weatherUrl);
          const weatherData = await weatherRes.json();
          const current = weatherData.current_weather;
          const daily = weatherData.daily;
          const hourly = weatherData.hourly;

          const weather = {
            code: current.weathercode,
            temp: Math.round(current.temperature),
            desc: WMO_CODES[current.weathercode] || "Unbekannt",
            icon: WMO_ICONS[current.weathercode] || "🌡️",
            forecast: daily.time.slice(0, 3).map((date, i) => ({
              date: date,
              day: new Date(date).toLocaleDateString("de-DE", {
                weekday: "short",
              }),
              icon: WMO_ICONS[daily.weathercode[i]] || "🌡️",
              max: Math.round(daily.temperature_2m_max[i]),
              min: Math.round(daily.temperature_2m_min[i]),
            })),
            fullForecast: {
              time: daily.time.slice(0, 7),
              weathercode: daily.weathercode.slice(0, 7),
              max: daily.temperature_2m_max.slice(0, 7),
              min: daily.temperature_2m_min.slice(0, 7),
            },
            hourly: hourly,
          };

          weatherCache[city.id] = weather;
          updateCardWeatherUI(city.id, weather);
          updateWeatherStats();
        } catch (error) {
          console.warn("Wetter für " + city.name + " fehlgeschlagen:", error);
        }
      }

      function updateCardWeatherUI(cityId, weather) {
        const cardData = cityCards[cityId];
        if (!cardData) return;
        cardData.weatherEl.innerHTML = `
      <div class="card-weather-icon">${weather.icon}</div>
      <div class="card-weather-info">
        <div class="card-weather-temp">${weather.temp}°C</div>
        <div class="card-weather-desc">${weather.desc}</div>
        
        <!-- NEUE ZEILE MIT ERWEITERTEN DATEN -->
        <div class="card-weather-extra" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px; display: flex; gap: 8px;">
           <span>🌅 ${formatTime(weather.sunrise)}</span>
           <span> ${formatTime(weather.sunset)}</span>
           <span style="color:${uvColor}">☀️ UV: ${weather.uvIndex || "-"}</span>
        </div>
      </div>
    `;
        cardData.forecastEl.innerHTML = weather.forecast
          .map(
            (day) => `
          <div class="card-forecast-day">
            <div class="card-forecast-name">${day.day}</div>
            <div class="card-forecast-icon">${day.icon}</div>
            <div class="card-forecast-temp">${day.max}°<span>/${day.min}°</span></div>
          </div>
        `,
          )
          .join("");
      }

      function updateWeatherStats() {
        let sunny = 0,
          rain = 0,
          cloudy = 0;
        const sunnyCodes = [0, 1];
        const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
        const cloudyCodes = [2, 3, 45, 48];

        Object.values(weatherCache).forEach((w) => {
          const code = parseInt(w.icon.replace(/[^0-9]/g, ""));
          if (sunnyCodes.includes(code)) sunny++;
          else if (rainCodes.includes(code)) rain++;
          else if (cloudyCodes.includes(code)) cloudy++;
        });

        if (statSunny) statSunny.textContent = sunny;
        if (statRain) statRain.textContent = rain;
        if (statCloudy) statCloudy.textContent = cloudy;
      }

      function loadAllVisibleWeather() {
        Object.values(cityCards).forEach((item) => {
          if (item.card.style.display !== "none") {
            loadCardWeather(item.city);
          }
        });
      }

      function applyFilter(query, skipAPISearch = false) {
        const term = query.toLowerCase().trim();
        const sWrapper = document.querySelector(".search-wrapper");

        if (term === "") {
          const wOverview = document.querySelector(".welcome-weather-overview");
          if (sWrapper && wOverview) wOverview.appendChild(sWrapper);
          if (statusMessage.parentElement !== welcomeHero) {
            welcomeHero.appendChild(statusMessage);
          }
        } else {
          if (sWrapper && welcomeHero)
            welcomeHero.parentNode.insertBefore(sWrapper, welcomeHero);
          if (statusMessage.parentElement === welcomeHero) {
            welcomeHero.parentNode.insertBefore(
              statusMessage,
              welcomeHero.nextSibling,
            );
          }
        }

        container.innerHTML = "";
        favContainer.innerHTML = "";

        if (term === "") {
          welcomeHero.classList.remove("hidden");
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
            statusMessage.innerHTML = `⭐ ${favorites.size} Favorit${favorites.size === 1 ? "" : "en"} – suche nach mehr.`;
          } else {
            favSection.style.display = "none";
            if (allTitle) allTitle.style.display = "none";
            Object.values(cityCards).forEach(
              (item) => (item.card.style.display = "none"),
            );
            statusMessage.innerHTML = `Tippe etwas ein, um eine Stadt zu suchen.`;
          }
          updateClocks();
          setTimeout(loadAllVisibleWeather, 500);
          return;
        }

        welcomeHero.classList.add("hidden");
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
          if (allTitle) allTitle.style.display = "block";
          [...favMatches, ...restMatches].forEach((m) => {
            container.appendChild(m.card);
            m.card.style.display = "";
          });
          statusMessage.textContent = `${matches.length} Städte gefunden${favMatches.length ? ` (davon ⭐ ${favMatches.length})` : ""}:`;
        }

        Object.values(cityCards).forEach((item) => {
          if (!matches.includes(item)) item.card.style.display = "none";
        });

        updateClocks();
        setTimeout(loadAllVisibleWeather, 500);

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
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=de&format=json`,
          );
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            let newCitiesAdded = 0;
            data.results.forEach((result) => {
              const existingId = (
                result.name.toLowerCase() +
                " " +
                (result.country_code || "x")
              ).replace(/[^a-z0-9]/g, "");
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
              statusMessage.textContent = `✅ ${newCitiesAdded} neue Stadt${newCitiesAdded === 1 ? "" : "e"} weltweit gefunden!`;
            }
          } else {
            statusMessage.textContent = `Keine Städte weltweit für '${query}' gefunden.`;
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
            item.timeEl.textContent = t.toLocaleTimeString("de-DE", {
              ...timeOptions,
              timeZone: item.city.timezone,
            });
            item.dateEl.textContent = t.toLocaleDateString("de-DE", {
              ...dateOptions,
              timeZone: item.city.timezone,
            });
          } catch (e) {
            item.timeEl.textContent = "N/A";
          }
        }
        if (activeCity) {
          try {
            detailTime.textContent = t.toLocaleTimeString("de-DE", {
              ...timeOptions,
              timeZone: activeCity.timezone,
            });
            detailDate.textContent = t.toLocaleDateString("de-DE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: activeCity.timezone,
            });
          } catch (e) {
            detailTime.textContent = "N/A";
          }
        }
      }

      function openDetail(city) {
        activeCity = city;
        detailZone.textContent = city.country + " " + city.name;
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        updateDetailStar();
        updateClocks();
        getWeatherForCity(city);
      }

      function closeDetail() {
        overlay.classList.remove("active");
        overlay.style.backgroundImage = "";
        document.body.style.overflow = "";
        activeCity = null;
        hourlyContainer.style.display = "none";
      }

      function updateDetailStar() {
        if (!activeCity) return;
        const isFav = favorites.has(activeCity.id);
        detailStarBtn.classList.toggle("active", isFav);
        detailStarBtn.textContent = isFav ? "★" : "☆";
      }

      async function getWeatherForCity(city) {
        weatherLoading.style.display = "block";
        weatherInfo.style.display = "none";
        weatherError.style.display = "none";
        forecastContainer.style.display = "none";
        hourlyContainer.style.display = "none";

        if (weatherCache[city.id] && weatherCache[city.id].hourly) {
          applyDetailBackground(weatherCache[city.id].code);
          updateDetailWeatherUI(weatherCache[city.id]);
          renderForecast(
            weatherCache[city.id].fullForecast ||
              weatherCache[city.id].forecast,
            city.id,
          );
          weatherLoading.style.display = "none";
          return;
        }

        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode&timezone=auto`;
          const weatherRes = await fetch(weatherUrl);
          const weatherData = await weatherRes.json();
          const current = weatherData.current_weather;
          const daily = weatherData.daily;
          const hourly = weatherData.hourly;

          const weather = {
            code: current.weathercode,
            temp: Math.round(current.temperature),
            desc: WMO_CODES[current.weathercode] || "Unbekannt",
            icon: WMO_ICONS[current.weathercode] || "🌡️",
            // Neue Daten
            sunrise: daily.sunrise ? daily.sunrise[0] : null,
            sunset: daily.sunset ? daily.sunset[0] : null,
            uvIndex: daily.uv_index_max ? daily.uv_index_max[0] : null,
            forecast: daily.time.slice(0, 3).map((date, i) => ({
              date: date,
              day: new Date(date).toLocaleDateString("de-DE", {
                weekday: "short",
              }),
              icon: WMO_ICONS[daily.weathercode[i]] || "🌡️",
              max: Math.round(daily.temperature_2m_max[i]),
              min: Math.round(daily.temperature_2m_min[i]),
            })),
            fullForecast: {
              time: daily.time.slice(0, 7),
              weathercode: daily.weathercode.slice(0, 7),
              max: daily.temperature_2m_max.slice(0, 7),
              min: daily.temperature_2m_min.slice(0, 7),
            },
            hourly: hourly,
          };

          weatherCache[city.id] = weather;
          applyDetailBackground(weather.code);
          updateDetailWeatherUI(weather);
          renderForecast(weather.fullForecast, city.id);
        } catch (error) {
          console.warn("Wetter für " + city.name + " fehlgeschlagen:", error);
          weatherLoading.style.display = "none";
          weatherError.style.display = "block";
        }
      }

      function updateDetailWeatherUI(w) {
        weatherLoading.style.display = "none";
        weatherInfo.style.display = "flex";

        const formatTime = (isoStr) =>
          isoStr
            ? new Date(isoStr).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--";

        weatherIcon.textContent = w.icon;
        weatherTemp.textContent = w.temp + "°C";

        // Beschreibung + Sonne + UV untereinander
        weatherDesc.innerHTML = `
        <div>${w.desc}</div>
        <div style="margin-top: 5px; font-size: 0.9rem; display: flex; gap: 15px; justify-content: center;">
            <span>🌅 ${formatTime(w.sunrise)}</span>
            <span>🌇 ${formatTime(w.sunset)}</span>
            <span>☀️ UV: ${w.uvIndex || "-"}</span>
        </div>
    `;
      }

      function renderForecast(forecast, cityId) {
        forecastScroll.innerHTML = "";
        const days = forecast.time || forecast;
        const codes =
          forecast.weathercode ||
          forecast.map((f) => parseInt(f.icon.replace(/[^0-9]/g, "")));
        const maxTemps = forecast.max || forecast.map((f) => f.max);
        const minTemps = forecast.min || forecast.map((f) => f.min);

        for (let i = 0; i < days.length; i++) {
          const date = days[i];
          const dayName = new Date(date).toLocaleDateString("de-DE", {
            weekday: "short",
          });
          const icon = WMO_ICONS[codes[i]] || "🌡️";
          const max = Math.round(maxTemps[i]);
          const min = Math.round(minTemps[i]);

          const el = document.createElement("div");
          el.className = "forecast-day";
          el.dataset.date = date;
          el.innerHTML = `
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="forecast-temps"><span>${max}°</span><span>/${min}°</span></div>
      `;
          el.addEventListener("click", () =>
            showHourlyForecast(cityId, date, el),
          );
          forecastScroll.appendChild(el);
        }
        forecastContainer.style.display = "block";
      }

      function showHourlyForecast(cityId, targetDate, clickedElement) {
        document
          .querySelectorAll(".forecast-day")
          .forEach((el) => el.classList.remove("selected"));
        clickedElement.classList.add("selected");

        const weather = weatherCache[cityId];
        if (!weather || !weather.hourly) {
          hourlyContainer.style.display = "none";
          return;
        }

        const hourly = weather.hourly;
        hourlyTitle.textContent = `⏱️ Stündlicher Verlauf – ${new Date(targetDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}`;
        hourlyScroll.innerHTML = "";
        const nowHour = new Date().getHours();

        for (let i = 0; i < hourly.time.length; i++) {
          const timeStr = hourly.time[i];
          if (timeStr.startsWith(targetDate)) {
            const hour = parseInt(timeStr.split("T")[1].split(":")[0]);
            const temp = Math.round(hourly.temperature_2m[i]);
            const wCode = hourly.weathercode[i];
            const icon = WMO_ICONS[wCode] || "🌡️";

            const el = document.createElement("div");
            el.className = "hourly-item";
            if (
              targetDate === new Date().toISOString().split("T")[0] &&
              hour === nowHour
            ) {
              el.classList.add("current");
            }
            el.innerHTML = `
          <div class="hourly-hour">${String(hour).padStart(2, "0")}:00</div>
          <div class="hourly-icon">${icon}</div>
          <div class="hourly-temp">${temp}°</div>
        `;
            hourlyScroll.appendChild(el);
          }
        }

        hourlyContainer.style.display = "block";
        hourlyContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }

      detailStarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeCity) toggleFavorite(activeCity.id);
      });

      detailClose.addEventListener("click", closeDetail);

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
        setTimeout(() => {
          if (document.activeElement !== searchInput) searchInput.focus();
        }, 0);
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

      applyFilter("");
      buildQuickAccess();
      setInterval(updateClocks, 1000);
    });
  }

  function applyDetailBackground(code) {
    const bgUrl = getWeatherBackground(code);
    overlay.style.backgroundImage = `linear-gradient(rgba(18, 18, 18, 0.6), rgba(18, 18, 18, 0.75)), url('${bgUrl}')`;
    overlay.style.backgroundSize = "cover";
    overlay.style.backgroundPosition = "center";
  }

  async function syncTime() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        "https://timeapi.io/api/time/current/zone?timeZone=UTC",
        { cache: "no-store", signal: controller.signal },
      );
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("API antwortet nicht");
      const data = await res.json();
      const serverTime = new Date(data.dateTime + "Z").getTime();
      timeOffset = serverTime - Date.now();
    } catch (err) {
      console.warn("Zeit-Sync fehlgeschlagen, verwende lokale Zeit:", err);
      timeOffset = 0;
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
  const weatherCache = {};

  function buildCard(city) {
    const card = document.createElement("div");
    card.className = "clock-card";
    card.style.display = "none";
    card.dataset.search = (city.name + " " + city.country).toLowerCase();
    card.dataset.cityId = city.id;

    const starBtn = document.createElement("button");
    starBtn.className = "star-btn";
    starBtn.dataset.cityId = city.id;
    starBtn.textContent = favorites.has(city.id) ? "★" : "☆";
    if (favorites.has(city.id)) starBtn.classList.add("active");
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(city.id);
    });

    const zoneName = document.createElement("div");
    zoneName.className = "zone-name";
    zoneName.innerHTML = `<span class="city-flag">${city.country}</span>${city.name}`;

    const timeEl = document.createElement("div");
    timeEl.className = "time";
    timeEl.textContent = "--:--:--";

    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.textContent = "...";

    const weatherEl = document.createElement("div");
    weatherEl.className = "card-weather";
    weatherEl.innerHTML = `
      <div class="card-weather-icon">🌡️</div>
      <div class="card-weather-info">
        <div class="card-weather-temp">--°C</div>
        <div class="card-weather-desc">Lädt...</div>
      </div>
    `;

    const forecastEl = document.createElement("div");
    forecastEl.className = "card-forecast";
    forecastEl.innerHTML = `
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
    `;

    card.append(starBtn, zoneName, timeEl, dateEl, weatherEl, forecastEl);
    card.addEventListener("click", () => openDetail(city));

    return { city, card, timeEl, dateEl, starBtn, weatherEl, forecastEl };
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
  const dateOptions = { weekday: "short", day: "2-digit", month: "2-digit" };

  function buildQuickAccess() {
    const popularCities = [
      "berlin",
      "london",
      "newyork",
      "tokyo",
      "sydney",
      "dubai",
    ];
    quickCities.innerHTML = "";
    popularCities.forEach((cityId) => {
      const city = cityCards[cityId];
      if (city) {
        const btn = document.createElement("button");
        btn.className = "quick-city-btn";
        btn.textContent = city.city.country + " " + city.city.name;
        btn.addEventListener("click", () => openDetail(city.city));
        quickCities.appendChild(btn);
      }
    });
  }

  async function loadCardWeather(city) {
    const cardData = cityCards[city.id];
    if (!cardData) return;
    if (weatherCache[city.id]) {
      updateCardWeatherUI(city.id, weatherCache[city.id]);
      return;
    }
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;
      const daily = weatherData.daily;
      const hourly = weatherData.hourly;
      const weather = {
        code: current.weathercode,
        temp: Math.round(current.temperature),
        desc: WMO_CODES[current.weathercode] || "Unbekannt",
        icon: WMO_ICONS[current.weathercode] || "🌡️",
        forecast: daily.time.slice(0, 3).map((date, i) => ({
          date: date,
          day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
          icon: WMO_ICONS[daily.weathercode[i]] || "🌡️",
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        })),
        fullForecast: {
          time: daily.time.slice(0, 7),
          weathercode: daily.weathercode.slice(0, 7),
          max: daily.temperature_2m_max.slice(0, 7),
          min: daily.temperature_2m_min.slice(0, 7),
        },
        hourly: hourly,
      };
      weatherCache[city.id] = weather;
      updateCardWeatherUI(city.id, weather);
      updateWeatherStats();
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen:", error);
    }
  }

  function updateCardWeatherUI(cityId, weather) {
    const cardData = cityCards[cityId];
    if (!cardData) return;
    cardData.weatherEl.innerHTML = `<div class="card-weather-icon">${weather.icon}</div><div class="card-weather-info"><div class="card-weather-temp">${weather.temp}°C</div><div class="card-weather-desc">${weather.desc}</div></div>`;
    cardData.forecastEl.innerHTML = weather.forecast
      .map(
        (day) =>
          `<div class="card-forecast-day"><div class="card-forecast-name">${day.day}</div><div class="card-forecast-icon">${day.icon}</div><div class="card-forecast-temp">${day.max}°<span>/${day.min}°</span></div></div>`,
      )
      .join("");
  }

  function updateWeatherStats() {
    let sunny = 0,
      rain = 0,
      cloudy = 0;
    const sunnyCodes = [0, 1];
    const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
    const cloudyCodes = [2, 3, 45, 48];
    Object.values(weatherCache).forEach((w) => {
      const code = parseInt(w.icon.replace(/[^0-9]/g, ""));
      if (sunnyCodes.includes(code)) sunny++;
      else if (rainCodes.includes(code)) rain++;
      else if (cloudyCodes.includes(code)) cloudy++;
    });
    if (statSunny) statSunny.textContent = sunny;
    if (statRain) statRain.textContent = rain;
    if (statCloudy) statCloudy.textContent = cloudy;
  }

  function loadAllVisibleWeather() {
    Object.values(cityCards).forEach((item) => {
      if (item.card.style.display !== "none") {
        loadCardWeather(item.city);
      }
    });
  }

  function applyFilter(query, skipAPISearch = false) {
    const term = query.toLowerCase().trim();
    const sWrapper = document.querySelector(".search-wrapper");

    if (term === "") {
      const wOverview = document.querySelector(".welcome-weather-overview");
      if (sWrapper && wOverview) wOverview.appendChild(sWrapper);
      if (statusMessage.parentElement !== welcomeHero) {
        welcomeHero.appendChild(statusMessage);
      }
    } else {
      if (sWrapper && welcomeHero)
        welcomeHero.parentNode.insertBefore(sWrapper, welcomeHero);
      if (statusMessage.parentElement === welcomeHero) {
        welcomeHero.parentNode.insertBefore(
          statusMessage,
          welcomeHero.nextSibling,
        );
      }
    }

    container.innerHTML = "";
    favContainer.innerHTML = "";

    if (term === "") {
      welcomeHero.classList.remove("hidden");
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
        statusMessage.innerHTML = `⭐ ${favorites.size} Favorit${favorites.size === 1 ? "" : "en"} – suche nach mehr.`;
      } else {
        favSection.style.display = "none";
        if (allTitle) allTitle.style.display = "none";
        Object.values(cityCards).forEach(
          (item) => (item.card.style.display = "none"),
        );
        statusMessage.innerHTML = `Tippe etwas ein, um eine Stadt zu suchen.`;
      }
      updateClocks();
      setTimeout(loadAllVisibleWeather, 500);
      return;
    }

    welcomeHero.classList.add("hidden");
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
      if (allTitle) allTitle.style.display = "block";
      [...favMatches, ...restMatches].forEach((m) => {
        container.appendChild(m.card);
        m.card.style.display = "";
      });
      statusMessage.textContent = `${matches.length} Städte gefunden${favMatches.length ? ` (davon ⭐ ${favMatches.length})` : ""}:`;
    }

    Object.values(cityCards).forEach((item) => {
      if (!matches.includes(item)) item.card.style.display = "none";
    });

    updateClocks();
    setTimeout(loadAllVisibleWeather, 500);

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
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=de&format=json`,
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
          statusMessage.textContent = `✅ ${newCitiesAdded} neue Stadt${newCitiesAdded === 1 ? "" : "e"} weltweit gefunden!`;
        }
      } else {
        statusMessage.textContent = `Keine Städte weltweit für '${query}' gefunden.`;
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
        item.timeEl.textContent = t.toLocaleTimeString("de-DE", {
          ...timeOptions,
          timeZone: item.city.timezone,
        });
        item.dateEl.textContent = t.toLocaleDateString("de-DE", {
          ...dateOptions,
          timeZone: item.city.timezone,
        });
      } catch (e) {
        item.timeEl.textContent = "N/A";
      }
    }
    if (activeCity) {
      try {
        detailTime.textContent = t.toLocaleTimeString("de-DE", {
          ...timeOptions,
          timeZone: activeCity.timezone,
        });
        detailDate.textContent = t.toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: activeCity.timezone,
        });
      } catch (e) {
        detailTime.textContent = "N/A";
      }
    }
  }

  function openDetail(city) {
    activeCity = city;
    detailZone.textContent = city.country + " " + city.name;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    updateDetailStar();
    updateClocks();
    getWeatherForCity(city);
  }

  function closeDetail() {
    overlay.classList.remove("active");
    overlay.style.backgroundImage = "";
    document.body.style.overflow = "";
    activeCity = null;
    hourlyContainer.style.display = "none";
  }

  function updateDetailStar() {
    if (!activeCity) return;
    const isFav = favorites.has(activeCity.id);
    detailStarBtn.classList.toggle("active", isFav);
    detailStarBtn.textContent = isFav ? "★" : "☆";
  }

  async function getWeatherForCity(city) {
    weatherLoading.style.display = "block";
    weatherInfo.style.display = "none";
    weatherError.style.display = "none";
    forecastContainer.style.display = "none";
    hourlyContainer.style.display = "none";

    if (weatherCache[city.id] && weatherCache[city.id].hourly) {
      applyDetailBackground(weatherCache[city.id].code);
      updateDetailWeatherUI(weatherCache[city.id]);
      renderForecast(
        weatherCache[city.id].fullForecast || weatherCache[city.id].forecast,
        city.id,
      );
      weatherLoading.style.display = "none";
      return;
    }

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;
      const daily = weatherData.daily;
      const hourly = weatherData.hourly;
      const weather = {
        code: current.weathercode,
        temp: Math.round(current.temperature),
        desc: WMO_CODES[current.weathercode] || "Unbekannt",
        icon: WMO_ICONS[current.weathercode] || "🌡️",
        forecast: daily.time.slice(0, 3).map((date, i) => ({
          date: date,
          day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
          icon: WMO_ICONS[daily.weathercode[i]] || "🌡️",
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        })),
        fullForecast: {
          time: daily.time.slice(0, 7),
          weathercode: daily.weathercode.slice(0, 7),
          max: daily.temperature_2m_max.slice(0, 7),
          min: daily.temperature_2m_min.slice(0, 7),
        },
        hourly: hourly,
      };

      weatherCache[city.id] = weather;
      applyDetailBackground(weather.code);
      updateDetailWeatherUI(weather);
      renderForecast(weather.fullForecast, city.id);
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen:", error);
      weatherLoading.style.display = "none";
      weatherError.style.display = "block";
    }
  }

  function updateDetailWeatherUI(w) {
    weatherLoading.style.display = "none";
    weatherInfo.style.display = "flex";
    weatherIcon.textContent = w.icon;
    weatherTemp.textContent = w.temp + "°C";
    weatherDesc.textContent = w.desc;
  }

  function renderForecast(forecast, cityId) {
    forecastScroll.innerHTML = "";
    const days = forecast.time || forecast;
    const codes =
      forecast.weathercode ||
      forecast.map((f) => parseInt(f.icon.replace(/[^0-9]/g, "")));
    const maxTemps = forecast.max || forecast.map((f) => f.max);
    const minTemps = forecast.min || forecast.map((f) => f.min);

    for (let i = 0; i < days.length; i++) {
      const date = days[i];
      const dayName = new Date(date).toLocaleDateString("de-DE", {
        weekday: "short",
      });
      const icon = WMO_ICONS[codes[i]] || "🌡️";
      const max = Math.round(maxTemps[i]);
      const min = Math.round(minTemps[i]);

      const el = document.createElement("div");
      el.className = "forecast-day";
      el.dataset.date = date;
      el.innerHTML = `
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="forecast-temps"><span>${max}°</span><span>/${min}°</span></div>
      `;
      el.addEventListener("click", () => showHourlyForecast(cityId, date, el));
      forecastScroll.appendChild(el);
    }
    forecastContainer.style.display = "block";
  }

  function showHourlyForecast(cityId, targetDate, clickedElement) {
    document
      .querySelectorAll(".forecast-day")
      .forEach((el) => el.classList.remove("selected"));
    clickedElement.classList.add("selected");
    const weather = weatherCache[cityId];
    if (!weather || !weather.hourly) {
      hourlyContainer.style.display = "none";
      return;
    }
    const hourly = weather.hourly;
    hourlyTitle.textContent = `⏱️ Stündlicher Verlauf – ${new Date(targetDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}`;
    hourlyScroll.innerHTML = "";

    const nowHour = new Date().getHours();

    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      if (timeStr.startsWith(targetDate)) {
        const hour = parseInt(timeStr.split("T")[1].split(":")[0]);
        const temp = Math.round(hourly.temperature_2m[i]);
        const wCode = hourly.weathercode[i];
        const icon = WMO_ICONS[wCode] || "🌡️";

        const el = document.createElement("div");
        el.className = "hourly-item";
        if (
          targetDate === new Date().toISOString().split("T")[0] &&
          hour === nowHour
        ) {
          el.classList.add("current");
        }
        el.innerHTML = `
          <div class="hourly-hour">${String(hour).padStart(2, "0")}:00</div>
          <div class="hourly-icon">${icon}</div>
          <div class="hourly-temp">${temp}°</div>
        `;
        hourlyScroll.appendChild(el);
      }
    }

    hourlyContainer.style.display = "block";
    hourlyContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  detailStarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (activeCity) toggleFavorite(activeCity.id);
  });
  detailClose.addEventListener("click", closeDetail);
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
    setTimeout(() => {
      if (document.activeElement !== searchInput) searchInput.focus();
    }, 0);
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

  applyFilter("");
  buildQuickAccess();
  setInterval(updateClocks, 1000);
  // --- THEME TOGGLE LOGIK ---
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  // Prüfen ob Light Mode gespeichert war
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeBtn.textContent = "☀️";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");

    // Speichern und Icon ändern
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeBtn.textContent = isLight ? "☀️" : "";
  });
});
