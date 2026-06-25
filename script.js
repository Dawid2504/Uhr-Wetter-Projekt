document.addEventListener("DOMContentLoaded", () => {
  const searchWrapper = document.querySelector(".search-wrapper");
  const weatherOverview = document.querySelector(".welcome-weather-overview");
  if (searchWrapper && weatherOverview) {
    weatherOverview.innerHTML = "";
    weatherOverview.appendChild(searchWrapper);
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
  let filterTimeout = null;

  const WMO_ICONS_DAY = {
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

  const WMO_ICONS_NIGHT = {
    0: "🌙",
    1: "🌙",
    2: "☁️",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌧️",
    53: "🌧️",
    55: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "❄️",
    80: "🌧️",
    81: "🌧️",
    82: "⛈️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };

  function getWeatherIcon(code, isNight) {
    if (isNight) return WMO_ICONS_NIGHT[code] || "🌡️";
    return WMO_ICONS_DAY[code] || "🌡️";
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
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weathercode&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;
      const daily = weatherData.daily;
      const hourly = weatherData.hourly;

      const isNight = isNightTime(
        daily.sunrise ? daily.sunrise[0] : null,
        daily.sunset ? daily.sunset[0] : null,
        city.timezone,
      );

      const weather = {
        code: current.weathercode,
        temp: Math.round(current.temperature),
        desc: WMO_CODES[current.weathercode] || "Unbekannt",
        icon: getWeatherIcon(current.weathercode, isNight),
        sunrise: daily.sunrise ? daily.sunrise[0] : null,
        sunset: daily.sunset ? daily.sunset[0] : null,
        uvIndex: daily.uv_index_max ? daily.uv_index_max[0] : null,
        forecast: daily.time.slice(0, 3).map((date, i) => ({
          date: date,
          day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
          icon: getWeatherIcon(daily.weathercode[i], false),
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        })),
        fullForecast: {
          time: daily.time.slice(0, 7),
          weathercode: daily.weathercode.slice(0, 7),
          max: daily.temperature_2m_max.slice(0, 7),
          min: daily.temperature_2m_min.slice(0, 7),
          sunrise: daily.sunrise ? daily.sunrise.slice(0, 7) : [],
          sunset: daily.sunset ? daily.sunset.slice(0, 7) : [],
        },
        hourly: hourly,
      };

      weatherCache[city.id] = weather;
      applyDetailBackground(weather.code);
      updateDetailWeatherUI(weather);
      renderForecast(weather.fullForecast, city.id);
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen: ", error);
      weatherLoading.style.display = "none";
      weatherError.style.display = "block";
    }
  }

  function isNightTime(sunrise, sunset, timezone) {
    if (!sunrise || !sunset || !timezone) return false;
    try {
      const nowInCity = new Date().toLocaleTimeString("de-DE", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const sunriseTime = sunrise.includes("T")
        ? sunrise.split("T")[1]
        : sunrise;
      const sunsetTime = sunset.includes("T") ? sunset.split("T")[1] : sunset;
      return nowInCity < sunriseTime || nowInCity > sunsetTime;
    } catch (e) {
      return false;
    }
  }

  function isNightTimeForHour(timeStr, sunrise, sunset) {
    if (!sunrise || !sunset || !timeStr) return false;
    try {
      const hourTime = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
      const sunriseTime = sunrise.includes("T")
        ? sunrise.split("T")[1]
        : sunrise;
      const sunsetTime = sunset.includes("T") ? sunset.split("T")[1] : sunset;
      return hourTime < sunriseTime || hourTime > sunsetTime;
    } catch (e) {
      return false;
    }
  }

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
  }

  function applyDetailBackground(code) {
    const bgUrl = getWeatherBackground(code);
    const isLight = document.body.classList.contains("light-mode");
    const overlayGradient = isLight
      ? "linear-gradient(rgba(244, 244, 244, 0.75), rgba(244, 244, 244, 0.9))"
      : "linear-gradient(rgba(18, 18, 18, 0.6), rgba(18, 18, 18, 0.8))";
    overlay.style.backgroundImage = `${overlayGradient}, url('${bgUrl}')`;
    overlay.style.backgroundSize = "cover";
    overlay.style.backgroundPosition = "center";

    const detailContent = document.querySelector(".detail-content");
    if (detailContent) detailContent.style.color = isLight ? "#111" : "#fff";
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
      timeOffset = new Date(data.dateTime + "Z").getTime() - Date.now();
    } catch (err) {
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
      id: "aachen",
      name: "Aachen",
      country: "🇩🇪",
      timezone: "Europe/Berlin",
      lat: 50.77,
      lon: 6.08,
    },
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
      .querySelectorAll(`.star-btn[data-city-id="${CSS.escape(cityId)}"]`)
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

  const formatTime = (isoStr) =>
    isoStr
      ? new Date(isoStr).toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";

  function getUvColor(uv) {
    if (uv === null || uv === undefined) return "var(--text-secondary)";
    if (uv <= 2) return "#4caf50";
    if (uv <= 5) return "#ffeb3b";
    if (uv <= 7) return "#ff9800";
    if (uv <= 10) return "#f44336";
    return "#9c27b0";
  }

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
      </div>`;

    const forecastEl = document.createElement("div");
    forecastEl.className = "card-forecast";
    forecastEl.innerHTML = `
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>
      <div class="card-forecast-day"><div class="card-forecast-name">---</div><div class="card-forecast-icon">🌡️</div><div class="card-forecast-temp">--°</div></div>`;

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
      "aachen",
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

      const isNight = isNightTime(
        daily.sunrise ? daily.sunrise[0] : null,
        daily.sunset ? daily.sunset[0] : null,
        city.timezone,
      );

      const weather = {
        code: current.weathercode,
        temp: Math.round(current.temperature),
        desc: WMO_CODES[current.weathercode] || "Unbekannt",
        icon: getWeatherIcon(current.weathercode, isNight),
        sunrise: daily.sunrise ? daily.sunrise[0] : null,
        sunset: daily.sunset ? daily.sunset[0] : null,
        uvIndex: daily.uv_index_max ? daily.uv_index_max[0] : null,
        forecast: daily.time.slice(0, 3).map((date, i) => ({
          date: date,
          day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
          icon: getWeatherIcon(daily.weathercode[i], false),
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        })),
        fullForecast: {
          time: daily.time.slice(0, 7),
          weathercode: daily.weathercode.slice(0, 7),
          max: daily.temperature_2m_max.slice(0, 7),
          min: daily.temperature_2m_min.slice(0, 7),
          sunrise: daily.sunrise ? daily.sunrise.slice(0, 7) : [],
          sunset: daily.sunset ? daily.sunset.slice(0, 7) : [],
        },
        hourly: hourly,
      };

      weatherCache[city.id] = weather;
      updateCardWeatherUI(city.id, weather);
      updateWeatherStats();
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen: ", error);
    }
  }

  function updateCardWeatherUI(cityId, weather) {
    const cardData = cityCards[cityId];
    if (!cardData) return;
    const uvColor = getUvColor(weather.uvIndex);
    cardData.weatherEl.innerHTML = `
      <div class="card-weather-icon">${weather.icon}</div>
      <div class="card-weather-info">
        <div class="card-weather-temp">${weather.temp}°C</div>
        <div class="card-weather-desc">${weather.desc}</div>
        <div class="card-weather-extra" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px; display: flex; gap: 8px; flex-wrap: wrap;">
          <span>🌅 ${formatTime(weather.sunrise)}</span>
          <span>🌇 ${formatTime(weather.sunset)}</span>
          <span style="color:${uvColor}">☀️ UV: ${weather.uvIndex !== null ? weather.uvIndex : "-"}</span>
        </div>
      </div>`;
    cardData.forecastEl.innerHTML = weather.forecast
      .map(
        (day) => `
        <div class="card-forecast-day">
          <div class="card-forecast-name">${day.day}</div>
          <div class="card-forecast-icon">${day.icon}</div>
          <div class="card-forecast-temp">${day.max}° <span>/${day.min}°</span></div>
        </div>`,
      )
      .join("");
  }

  function updateWeatherStats() {
    let sunny = 0,
      rain = 0,
      cloudy = 0;
    const sunnyCodes = [0, 1],
      rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99],
      cloudyCodes = [2, 3, 45, 48];
    Object.values(weatherCache).forEach((w) => {
      const code = parseInt(w.code);
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
      if (item.card.style.display !== "none") loadCardWeather(item.city);
    });
  }

  function applyFilter(query, skipAPISearch = false) {
    const term = query.toLowerCase().trim();
    const sWrapper = document.querySelector(".search-wrapper");
    if (term === "") {
      const wOverview = document.querySelector(".welcome-weather-overview");
      if (sWrapper && wOverview) wOverview.appendChild(sWrapper);
      if (statusMessage.parentElement !== welcomeHero)
        welcomeHero.appendChild(statusMessage);
    } else {
      if (sWrapper && welcomeHero)
        welcomeHero.parentNode.insertBefore(sWrapper, welcomeHero);
      if (statusMessage.parentElement === welcomeHero)
        welcomeHero.parentNode.insertBefore(
          statusMessage,
          welcomeHero.nextSibling,
        );
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
        if (newCitiesAdded > 0)
          statusMessage.textContent = `✅ ${newCitiesAdded} neue Stadt${newCitiesAdded === 1 ? "" : "e"} weltweit gefunden!`;
      } else {
        statusMessage.textContent = `Keine Städte weltweit für '${query}' gefunden.`;
      }
    } catch (error) {
      console.warn("API-Suche fehlgeschlagen: ", error);
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

  // ===== RADAR =====
  let radarMap = null,
    radarFrames = [],
    satelliteFrames = [],
    radarCurrentPos = 0,
    radarTimer = null,
    radarLayers = {},
    satelliteLayers = {},
    activeMapLayer = "rain",
    radarHost = "",
    cityMarker = null,
    detailMarkers = [];

  async function initRadar(city) {
    const radarSection = document.getElementById("radar-section");
    if (!radarSection) return;
    radarSection.style.display = "block";
    if (!radarMap) {
      radarMap = L.map("radar-map", {
        center: [city.lat, city.lon],
        zoom: 6,
        zoomControl: true,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(radarMap);
      setTimeout(() => radarMap.invalidateSize(), 100);

      document.querySelectorAll(".radar-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          document
            .querySelectorAll(".radar-tab")
            .forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          activeMapLayer = tab.dataset.layer;
          updateMapLayer();
        });
      });
    } else {
      radarMap.setView([city.lat, city.lon], 6);
      clearMapLayers();
    }

    if (cityMarker) radarMap.removeLayer(cityMarker);
    const weather = weatherCache[city.id];
    const popupContent = `<b>${city.name}</b><br>${weather ? weather.temp + "°C " + weather.desc : "Lädt..."}`;
    cityMarker = L.marker([city.lat, city.lon])
      .addTo(radarMap)
      .bindPopup(popupContent)
      .openPopup();

    await loadRainViewerData();
    updateMapLayer();
  }

  async function loadRainViewerData() {
    try {
      const res = await fetch(
        "https://api.rainviewer.com/public/weather-maps.json",
      );
      const data = await res.json();
      radarHost = data.host;
      radarFrames = data.radar.past;
      satelliteFrames = data.satellite.ir || [];
      radarCurrentPos = radarFrames.length - 1;
    } catch (err) {
      console.warn("RainViewer API Fehler:", err);
    }
  }

  function updateMapLayer() {
    Object.values(radarLayers).forEach(
      (layer) =>
        layer &&
        radarMap &&
        radarMap.hasLayer(layer) &&
        radarMap.removeLayer(layer),
    );
    Object.values(satelliteLayers).forEach(
      (layer) =>
        layer &&
        radarMap &&
        radarMap.hasLayer(layer) &&
        radarMap.removeLayer(layer),
    );
    detailMarkers.forEach(
      (m) => radarMap && radarMap.hasLayer(m) && radarMap.removeLayer(m),
    );
    const controls = document.querySelector(".radar-controls");
    if (activeMapLayer === "rain") {
      if (controls) controls.style.display = "flex";
      radarCurrentPos = radarFrames.length - 1;
      showRadarFrame(radarCurrentPos);
    } else if (activeMapLayer === "clouds") {
      if (controls) controls.style.display = "flex";
      radarCurrentPos = satelliteFrames.length - 1;
      showSatelliteFrame(radarCurrentPos);
    } else if (activeMapLayer === "details") {
      if (controls) controls.style.display = "none";
      showDetailMarkers();
    }
  }

  function showSatelliteFrame(pos) {
    if (!satelliteFrames.length) return;
    if (pos < 0) pos = satelliteFrames.length - 1;
    if (pos >= satelliteFrames.length) pos = 0;
    radarCurrentPos = pos;
    const frame = satelliteFrames[pos];
    if (!frame) return;
    const timeLabel = document.getElementById("radar-time");
    if (timeLabel)
      timeLabel.textContent = new Date(frame.time * 1000).toLocaleTimeString(
        "de-DE",
        { hour: "2-digit", minute: "2-digit" },
      );
    Object.values(satelliteLayers).forEach(
      (layer) =>
        layer && radarMap.hasLayer(layer) && radarMap.removeLayer(layer),
    );

    if (!satelliteLayers[pos]) {
      const tileUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/0/0_0.png`;
      const layer = L.tileLayer(tileUrl, {
        opacity: 0.6,
        maxZoom: 10,
        zIndex: 10,
      });
      satelliteLayers[pos] = layer;
      layer.addTo(radarMap);
    } else {
      satelliteLayers[pos].addTo(radarMap);
    }
  }

  function showDetailMarkers() {
    const active = activeCity;
    if (!active) return;
    radarMap.setZoom(7);
    const nearbyCities = cityDatabase
      .filter((c) => {
        if (c.id === active.id) return false;
        const dist = Math.sqrt(
          Math.pow(c.lat - active.lat, 2) + Math.pow(c.lon - active.lon, 2),
        );
        return dist < 4;
      })
      .slice(0, 8);
    nearbyCities.forEach((c) => {
      const w = weatherCache[c.id];
      const temp = w ? w.temp + "°" : "?";
      const icon = w ? w.icon : "🌡️";

      const marker = L.circleMarker([c.lat, c.lon], {
        radius: 10,
        fillColor: "#00ff99",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(radarMap);

      marker.bindPopup(
        `<b>${c.country} ${c.name}</b><br>${icon} ${temp} ${w ? w.desc : ""}`,
      );
      detailMarkers.push(marker);

      if (!w) loadCardWeather(c);
    });
  }

  function showRadarFrame(pos) {
    if (!radarFrames.length) return;
    if (pos < 0) pos = radarFrames.length - 1;
    if (pos >= radarFrames.length) pos = 0;
    radarCurrentPos = pos;
    const frame = radarFrames[pos];
    const timeLabel = document.getElementById("radar-time");
    if (timeLabel)
      timeLabel.textContent = new Date(frame.time * 1000).toLocaleTimeString(
        "de-DE",
        { hour: "2-digit", minute: "2-digit" },
      );
    Object.values(radarLayers).forEach((layer) => {
      if (layer && radarMap && radarMap.hasLayer(layer))
        radarMap.removeLayer(layer);
    });

    if (!radarLayers[pos]) {
      const tileUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      const layer = L.tileLayer(tileUrl, {
        opacity: 0.7,
        maxZoom: 10,
        zIndex: 10,
      });
      radarLayers[pos] = layer;
      layer.addTo(radarMap);
    } else {
      radarLayers[pos].addTo(radarMap);
    }
  }

  function clearMapLayers() {
    Object.values(radarLayers).forEach((layer) => {
      if (layer && radarMap && radarMap.hasLayer(layer))
        radarMap.removeLayer(layer);
    });
    Object.values(satelliteLayers).forEach((layer) => {
      if (layer && radarMap && radarMap.hasLayer(layer))
        radarMap.removeLayer(layer);
    });
    detailMarkers.forEach((m) => {
      if (radarMap && radarMap.hasLayer(m)) radarMap.removeLayer(m);
    });
    detailMarkers = [];
    if (cityMarker) {
      radarMap.removeLayer(cityMarker);
      cityMarker = null;
    }
    if (radarTimer) {
      clearInterval(radarTimer);
      radarTimer = null;
      const playBtn = document.getElementById("radar-play");
      if (playBtn) playBtn.textContent = "▶️";
    }
  }

  function toggleRadarPlay() {
    const playBtn = document.getElementById("radar-play");
    if (!playBtn) return;
    if (radarTimer) {
      clearInterval(radarTimer);
      radarTimer = null;
      playBtn.textContent = "▶️";
    } else {
      playBtn.textContent = "⏸️";
      radarTimer = setInterval(() => {
        if (activeMapLayer === "rain") showRadarFrame(radarCurrentPos + 1);
        else if (activeMapLayer === "clouds")
          showSatelliteFrame(radarCurrentPos + 1);
      }, 600);
    }
  }

  function openDetail(city) {
    activeCity = city;
    const url = new URL(window.location);
    url.searchParams.set("city", city.id);
    window.history.pushState({ cityId: city.id }, "", url);
    detailZone.textContent = city.country + " " + city.name;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    updateDetailStar();
    updateClocks();
    getWeatherForCity(city);
    initRadar(city);
  }

  function closeDetail() {
    overlay.classList.remove("active");
    const url = new URL(window.location);
    url.searchParams.delete("city");
    window.history.pushState({}, "", url);
    overlay.style.backgroundImage = "";
    document.body.style.overflow = "";
    activeCity = null;
    hourlyContainer.style.display = "none";
    const radarSection = document.getElementById("radar-section");
    if (radarSection) radarSection.style.display = "none";
    clearMapLayers();
  }

  function updateDetailStar() {
    if (!activeCity) return;
    const isFav = favorites.has(activeCity.id);
    detailStarBtn.classList.toggle("active", isFav);
    detailStarBtn.textContent = isFav ? "★" : "☆";
  }

  function updateDetailWeatherUI(w) {
    weatherLoading.style.display = "none";
    weatherInfo.style.display = "flex";
    const uvColor = getUvColor(w.uvIndex);
    weatherIcon.textContent = w.icon;
    weatherTemp.textContent = w.temp + "°C";
    weatherDesc.innerHTML = `
    <div>${w.desc}</div>
    <div style="margin-top: 8px; font-size: 0.95rem; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; color: var(--text-secondary);">
      <span style="color:${uvColor}">☀️ UV: ${w.uvIndex !== null ? w.uvIndex : "-"}</span>
    </div>`;

    // Startet die neue Sonnen-Mond-Animation
    if (activeCity) {
      updateSunMoonTracker(w.sunrise, w.sunset, activeCity.timezone);
    }
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
      const icon = getWeatherIcon(codes[i], false);
      const max = Math.round(maxTemps[i]);
      const min = Math.round(minTemps[i]);

      const el = document.createElement("div");
      el.className = "forecast-day";
      el.dataset.date = date;
      el.innerHTML = `
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="forecast-temps"><span>${max}°</span> <span>/${min}°</span></div>`;
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
    const fullForecast = weather.fullForecast;

    let sunrise = null;
    let sunset = null;
    if (fullForecast && fullForecast.time) {
      const dayIndex = fullForecast.time.indexOf(targetDate);
      if (dayIndex !== -1) {
        sunrise = fullForecast.sunrise ? fullForecast.sunrise[dayIndex] : null;
        sunset = fullForecast.sunset ? fullForecast.sunset[dayIndex] : null;
      }
    }

    hourlyTitle.textContent = `⏱️ Stündlicher Verlauf – ${new Date(targetDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}`;
    hourlyScroll.innerHTML = "";

    const nowHour = new Date().getHours();
    const todayDateStr = new Date().toISOString().split("T")[0];
    const isToday = targetDate === todayDateStr;

    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      if (timeStr.startsWith(targetDate)) {
        const hour = parseInt(timeStr.split("T")[1].split(":")[0]);
        if (isToday && hour < nowHour) continue;

        const temp = Math.round(hourly.temperature_2m[i]);
        const wCode = hourly.weathercode[i];

        const isNightHour = isNightTimeForHour(timeStr, sunrise, sunset);
        const icon = getWeatherIcon(wCode, isNightHour);

        const el = document.createElement("div");
        el.className = "hourly-item";
        if (isToday && hour === nowHour) el.classList.add("current");
        el.innerHTML = `
          <div class="hourly-hour">${String(hour).padStart(2, "0")}:00</div>
          <div class="hourly-icon">${icon}</div>
          <div class="hourly-temp">${temp}°</div>`;
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
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => applyFilter(e.target.value), 300);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(filterTimeout);
      applyFilter(e.target.value);
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

  const params = new URLSearchParams(window.location.search);
  const urlCityId = params.get("city");
  if (urlCityId && cityCards[urlCityId]) {
    openDetail(cityCards[urlCityId].city);
  }

  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.cityId && cityCards[event.state.cityId]) {
      openDetail(cityCards[event.state.cityId].city);
    } else {
      closeDetail();
    }
  });

  setInterval(updateClocks, 1000);

  const themeBtn = document.getElementById("theme-toggle");
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    themeBtn.textContent = "☀️";
  }
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeBtn.textContent = isLight ? "☀️" : "🌙";
  });

  const radarPrevBtn = document.getElementById("radar-prev");
  const radarNextBtn = document.getElementById("radar-next");
  const radarPlayBtn = document.getElementById("radar-play");
  if (radarPrevBtn)
    radarPrevBtn.addEventListener("click", () => {
      if (radarTimer) toggleRadarPlay();
      if (activeMapLayer === "rain") showRadarFrame(radarCurrentPos - 1);
      else if (activeMapLayer === "clouds")
        showSatelliteFrame(radarCurrentPos - 1);
    });
  if (radarNextBtn)
    radarNextBtn.addEventListener("click", () => {
      if (radarTimer) toggleRadarPlay();
      if (activeMapLayer === "rain") showRadarFrame(radarCurrentPos + 1);
      else if (activeMapLayer === "clouds")
        showSatelliteFrame(radarCurrentPos + 1);
    });
  if (radarPlayBtn) radarPlayBtn.addEventListener("click", toggleRadarPlay);

  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  // Neue Funktion zur Berechnung des Sonnen/Mond-Verlaufs
  function updateSunMoonTracker(sunriseStr, sunsetStr, timezone) {
    const tracker = document.getElementById("sun-moon-tracker");
    const icon = document.getElementById("tracker-icon");
    const startLabel = document.getElementById("tracker-start");
    const endLabel = document.getElementById("tracker-end");

    if (!sunriseStr || !sunsetStr || !timezone) {
      tracker.style.display = "none";
      return;
    }

    tracker.style.display = "block";

    const nowStr = new Date().toLocaleString("en-US", { timeZone: timezone });
    const now = new Date(nowStr).getTime();
    const sunrise = new Date(sunriseStr).getTime();
    const sunset = new Date(sunsetStr).getTime();

    let isDay = now >= sunrise && now <= sunset;
    let start, end, progress;

    if (isDay) {
      start = sunrise;
      end = sunset;
      icon.textContent = "☀️";
      startLabel.textContent = `🌅 ${formatTime(sunriseStr)}`;
      endLabel.textContent = `🌇 ${formatTime(sunsetStr)}`;
    } else {
      icon.textContent = "🌙";
      const oneDay = 24 * 60 * 60 * 1000;

      if (now < sunrise) {
        start = sunset - oneDay;
        end = sunrise;
      } else {
        start = sunset;
        end = sunrise + oneDay;
      }

      startLabel.textContent = `🌇 ${formatTime(new Date(start).toISOString())}`;
      endLabel.textContent = `🌅 ${formatTime(new Date(end).toISOString())}`;
    }

    const totalDuration = end - start;
    const elapsed = now - start;
    progress = Math.max(0, Math.min(1, elapsed / totalDuration));

    const angle = Math.PI - progress * Math.PI;
    const radius = 125;

    const x = radius + radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    icon.style.left = `${x}px`;
    icon.style.bottom = `${y}px`;
  }
  // ===== 1. FEHLENDE SONNEN-/MOND-FUNKTION =====
  function updateSunMoonTracker(sunriseISO, sunsetISO, timezone) {
    const tracker = document.getElementById("sun-moon-tracker");
    const icon = document.getElementById("tracker-icon");
    const startSpan = document.getElementById("tracker-start");
    const endSpan = document.getElementById("tracker-end");

    if (!tracker || !icon || !startSpan || !endSpan) return;

    if (!sunriseISO || !sunsetISO) {
      tracker.style.display = "none";
      return;
    }

    tracker.style.display = "block";

    const sunRiseTime = new Date(sunriseISO);
    const sunSetTime = new Date(sunsetISO);

    // Aktuelle Zeit in der Zeitzone der ausgewählten Stadt
    const nowInCityStr = new Date().toLocaleString("en-US", {
      timeZone: timezone,
    });
    const cityNow = new Date(nowInCityStr);

    startSpan.textContent = sunRiseTime.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    endSpan.textContent = sunSetTime.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Berechnung des Fortschritts
    const totalDuration = sunSetTime.getTime() - sunRiseTime.getTime();
    const elapsed = cityNow.getTime() - sunRiseTime.getTime();

    let progress = elapsed / totalDuration;

    if (progress < 0 || progress > 1) {
      // Es ist Nacht
      icon.textContent = "🌙";
      progress = progress < 0 ? 0 : 1; // Bleibt am Rand stehen
    } else {
      // Es ist Tag
      icon.textContent = "☀️";
    }

    // Mathematische Berechnung der Bogen-Position (Halbkreis)
    const angle = progress * Math.PI; // 0 bis Pi (0 bis 180 Grad)
    const x = 50 - 50 * Math.cos(angle); // Links in % (0% bis 100%)
    const y = Math.sin(angle) * 100; // Höhe in % (0% bis 100%)

    icon.style.left = `${x}%`;
    icon.style.bottom = `${y}%`;
  }

  // ===== 2. MODAL LOGIK FÜR IMPRESSUM & DATENSCHUTZ =====
  const modal = document.querySelector(".modal");
  const modalContent = document.querySelector(".modal-content");

  // Funktion zum Öffnen der Rechtstexte im Popup
  function openModal(title, contentHTML) {
    modalContent.innerHTML = `
      <button class="modal-close" id="dynamic-modal-close">✕</button>
      <h2>${title}</h2>
      <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; max-height: 60vh; overflow-y: auto; padding: 10px;">
        ${contentHTML}
      </div>
    `;

    // Schließen-Button im Modal
    document
      .getElementById("dynamic-modal-close")
      .addEventListener("click", () => {
        modal.classList.remove("active");
      });

    modal.classList.add("active");
  }

  // Modal schließen, wenn man außerhalb (ins Dunkle) klickt
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  const linkImpressum = document.getElementById("link-impressum");
  const linkDatenschutz = document.getElementById("link-datenschutz");

  if (linkImpressum) {
    linkImpressum.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(
        "Impressum",
        `
        <h3>Angaben gemäß § 5 TMG</h3>
        <p>Dawid Makowski<br>
        Website: <a href="https://dawid-makowski.de" target="_blank" style="color: var(--accent);">dawid-makowski.de</a></p>
        
        <h3>Kontakt</h3>
        <p>Bitte nutzen Sie die Kontaktmöglichkeiten auf meiner persönlichen Webseite zur Kontaktaufnahme.</p>
        
        <h3>Haftung für Inhalte</h3>
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
        
        <h3>Urheberrecht</h3>
        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.</p>
      `,
      );
    });
  }

  if (linkDatenschutz) {
    linkDatenschutz.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(
        "Datenschutzerklärung",
        `
        <h3>1. Datenschutz auf einen Blick</h3>
        <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
        
        <h3>2. Datenerfassung auf dieser Website</h3>
        <p><strong>Verantwortlicher:</strong> Dawid Makowski</p>
        <p>Diese Wetter-Anwendung ruft Wetter- und Kartendaten über externe APIs (wie Open-Meteo, RainViewer, OpenStreetMap) ab. Bei diesen Anfragen wird Ihre IP-Adresse aus technischen Gründen an die jeweiligen Server der Dienstanbieter übertragen, um die Wetterdaten korrekt an Sie ausliefern zu können.</p>
        
        <h3>3. Lokale Speicherung (Local Storage)</h3>
        <p>Zur Verbesserung der Benutzererfahrung werden Ihre gespeicherten Favoriten (Städte) und das gewählte Theme (Hell/Dunkel) ausschließlich lokal in Ihrem Browser (Local Storage) gespeichert. Es findet keine Übertragung dieser Einstellungsdaten an unsere Server statt. Wir verwenden <strong>keine Tracking-Cookies</strong>.</p>
        
        <h3>4. Externe Links</h3>
        <p>Auf dieser Website befinden sich Links zu externen Websites. Für den Datenschutz auf diesen externen Seiten sind wir nicht verantwortlich.</p>
      `,
      );
    });
  }
});
