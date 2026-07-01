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

  // ===== EINHEITEN (°C / °F) =====
  const UNIT_KEY = "weltinfos_unit";
  let tempUnit = localStorage.getItem(UNIT_KEY) === "F" ? "F" : "C";

  // Wandelt einen in °C gelieferten Wert in die aktuell gewählte Einheit um.
  function convTemp(celsius) {
    if (celsius == null || isNaN(celsius)) return celsius;
    return tempUnit === "F"
      ? Math.round((celsius * 9) / 5 + 32)
      : Math.round(celsius);
  }
  // Formatiert einen °C-Wert komplett (z. B. "21°C").
  function fmtTemp(celsius, withUnit = true) {
    if (celsius == null || isNaN(celsius))
      return "--°" + (withUnit ? tempUnit : "");
    return convTemp(celsius) + "°" + (withUnit ? tempUnit : "");
  }

  // ===== ANIMIERTE SVG-WETTER-ICONS =====
  // Alle Icons nutzen currentColor + die Akzentfarbe und animieren per CSS.
  function svgWeatherIcon(code, isNight, size) {
    const cls = "wx-svg";
    const s = size || 1;
    const wrap = (inner, extra) =>
      `<span class="wx-icon ${extra || ""}" style="--wx-size:${s}em">` +
      `<svg viewBox="0 0 64 64" class="${cls}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg></span>`;

    const sun = (cx = 32, cy = 30, r = 12) => `
      <g class="wx-sun">
        <circle cx="${cx}" cy="${cy}" r="${r}" class="wx-sun-core"/>
        <g class="wx-rays" stroke-linecap="round">
          ${Array.from({ length: 8 })
            .map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = cx + Math.cos(a) * (r + 4);
              const y1 = cy + Math.sin(a) * (r + 4);
              const x2 = cx + Math.cos(a) * (r + 10);
              const y2 = cy + Math.sin(a) * (r + 10);
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
            })
            .join("")}
        </g>
      </g>`;

    const moon = `
      <g class="wx-moon">
        <path d="M40 16a16 16 0 1 0 8 30 20 20 0 0 1-8-30z"/>
      </g>`;

    const cloud = (extraCls = "", y = 0) => `
      <g class="wx-cloud ${extraCls}" transform="translate(0 ${y})">
        <path d="M22 44a10 10 0 0 1 .6-19.98A14 14 0 0 1 49 28a8 8 0 0 1-1 16z"/>
      </g>`;

    const stars = Array.from({ length: 5 })
      .map((_, i) => {
        const x = [10, 50, 18, 44, 32][i];
        const y = [14, 18, 40, 38, 10][i];
        return `<circle class="wx-star" cx="${x}" cy="${y}" r="1.4" style="animation-delay:${i * 0.4}s"/>`;
      })
      .join("");

    const rain = (drops = 3) =>
      `<g class="wx-rain" stroke-linecap="round">` +
      Array.from({ length: drops })
        .map(
          (_, i) =>
            `<line class="wx-drop" x1="${20 + i * 9}" y1="46" x2="${18 + i * 9}" y2="54" style="animation-delay:${i * 0.25}s"/>`,
        )
        .join("") +
      `</g>`;

    const snow = (flakes = 3) =>
      `<g class="wx-snow">` +
      Array.from({ length: flakes })
        .map(
          (_, i) =>
            `<circle class="wx-flake" cx="${21 + i * 9}" cy="50" r="2" style="animation-delay:${i * 0.4}s"/>`,
        )
        .join("") +
      `</g>`;

    const bolt = `<polygon class="wx-bolt" points="32,44 27,54 33,54 29,62 40,50 34,50 38,44"/>`;
    const fog = `<g class="wx-fog" stroke-linecap="round">
        <line x1="14" y1="40" x2="50" y2="40"/>
        <line x1="18" y1="46" x2="46" y2="46"/>
        <line x1="16" y1="52" x2="48" y2="52"/>
      </g>`;

    // Code-Zuordnung
    if ([0, 1].includes(code))
      return isNight ? wrap(moon + stars, "wx-night") : wrap(sun());
    if (code === 2)
      return isNight
        ? wrap(moon + cloud("wx-cloud-front", 4))
        : wrap(sun(38, 24, 8) + cloud("wx-cloud-front", 6));
    if (code === 3) return wrap(cloud("wx-cloud-solo"));
    if ([45, 48].includes(code)) return wrap(cloud("wx-cloud-solo", -4) + fog);
    if ([51, 53, 55, 61, 63, 80, 81].includes(code))
      return wrap(cloud("wx-cloud-solo", -6) + rain(3));
    if ([65, 82].includes(code))
      return wrap(cloud("wx-cloud-solo", -6) + rain(4));
    if ([71, 73, 75].includes(code))
      return wrap(cloud("wx-cloud-solo", -6) + snow(3));
    if ([95, 96, 99].includes(code))
      return wrap(cloud("wx-cloud-solo wx-cloud-dark", -6) + bolt + rain(2));
    return isNight ? wrap(moon + stars, "wx-night") : wrap(sun());
  }

  // ===== UNWETTERWARNUNGEN =====
  // Bestimmt anhand von Code, Temperatur, UV und Wind eine Warnstufe.
  function getWeatherAlert(code, tempC, uv, windKmh) {
    // Gewitter / schwere Schauer
    if ([95, 96, 99].includes(code))
      return { level: "severe", icon: "⛈️", label: "Gewitterwarnung" };
    if ([82].includes(code))
      return { level: "severe", icon: "🌧️", label: "Starkregen" };
    if ([75].includes(code))
      return { level: "warn", icon: "❄️", label: "Starker Schneefall" };
    // Hitze
    if (tempC != null && tempC >= 35)
      return { level: "severe", icon: "🥵", label: "Extreme Hitze" };
    if (tempC != null && tempC >= 30)
      return { level: "warn", icon: "🌡️", label: "Hitzewarnung" };
    // Strenger Frost
    if (tempC != null && tempC <= -10)
      return { level: "warn", icon: "🥶", label: "Strenger Frost" };
    // Sturm
    if (windKmh != null && windKmh >= 75)
      return { level: "severe", icon: "🌬️", label: "Sturm" };
    if (windKmh != null && windKmh >= 50)
      return { level: "warn", icon: "💨", label: "Windig" };
    // Sehr hohe UV-Belastung
    if (uv != null && uv >= 8)
      return { level: "warn", icon: "☀️", label: "Sehr hohe UV-Strahlung" };
    return null;
  }

  // Holt die Wetterdaten einer Stadt von der API und baut das Cache-Objekt.
  // Wird sowohl von der Detailansicht als auch von den Karten genutzt.
  async function fetchWeather(city) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&current=temperature_2m,relative_humidity_2m,apparent_temperature,weathercode,wind_speed_10m,wind_direction_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&hourly=temperature_2m,weathercode,precipitation_probability,apparent_temperature,relative_humidity_2m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    const cur = weatherData.current || {};

    const isNight = isNightTime(
      daily.sunrise ? daily.sunrise[0] : null,
      daily.sunset ? daily.sunset[0] : null,
      city.timezone,
    );

    const uvToday = daily.uv_index_max ? daily.uv_index_max[0] : null;

    // Fallback: Wenn der "current"-Block einzelne Werte nicht liefert,
    // greifen wir auf den passenden Stunden-Eintrag (hourly) zurück.
    // So sind "Gefühlt" und "Luftfeuchte" auch dann gefüllt, wenn die
    // API sie im current-Objekt nicht mitschickt.
    let hourIdx = -1;
    if (hourly && Array.isArray(hourly.time)) {
      const refIso = (cur && cur.time) || (current && current.time) || null;
      if (refIso) {
        // exakte Übereinstimmung der Stunde suchen
        const refHour = refIso.slice(0, 13); // "YYYY-MM-DDTHH"
        hourIdx = hourly.time.findIndex((t) => t.slice(0, 13) === refHour);
      }
      if (hourIdx === -1) {
        // Nächstgelegene vergangene Stunde als Näherung
        const nowMs = Date.now();
        let best = Infinity;
        hourly.time.forEach((t, i) => {
          const diff = Math.abs(new Date(t).getTime() - nowMs);
          if (diff < best) {
            best = diff;
            hourIdx = i;
          }
        });
      }
    }
    const hourlyVal = (arr) =>
      hourIdx > -1 && arr && arr[hourIdx] != null ? arr[hourIdx] : null;

    const apparentRaw =
      cur.apparent_temperature != null
        ? cur.apparent_temperature
        : hourlyVal(hourly && hourly.apparent_temperature);
    const apparent = apparentRaw != null ? Math.round(apparentRaw) : null;

    const humidityRaw =
      cur.relative_humidity_2m != null
        ? cur.relative_humidity_2m
        : hourlyVal(hourly && hourly.relative_humidity_2m);
    const windSpeed =
      cur.wind_speed_10m != null
        ? Math.round(cur.wind_speed_10m)
        : current.windspeed != null
          ? Math.round(current.windspeed)
          : null;

    const weather = {
      code: current.weathercode,
      temp: Math.round(current.temperature),
      desc: WMO_CODES[current.weathercode] || "Unbekannt",
      icon: getWeatherIcon(current.weathercode, isNight),
      isNight: isNight,
      apparent: apparent,
      humidity: humidityRaw != null ? Math.round(humidityRaw) : null,
      wind: windSpeed,
      windDir: cur.wind_direction_10m != null ? cur.wind_direction_10m : null,
      alert: getWeatherAlert(
        current.weathercode,
        Math.round(current.temperature),
        uvToday,
        windSpeed,
      ),
      sunrise: daily.sunrise ? daily.sunrise[0] : null,
      sunset: daily.sunset ? daily.sunset[0] : null,
      uvIndex: uvToday,
      forecast: daily.time.slice(0, 3).map((date, i) => ({
        date: date,
        day: new Date(date).toLocaleDateString("de-DE", { weekday: "short" }),
        code: daily.weathercode[i],
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
      })),
      fullForecast: {
        time: daily.time.slice(0, 7),
        weathercode: daily.weathercode.slice(0, 7),
        max: daily.temperature_2m_max.slice(0, 7),
        min: daily.temperature_2m_min.slice(0, 7),
        precipProb: daily.precipitation_probability_max
          ? daily.precipitation_probability_max.slice(0, 7)
          : [],
        sunrise: daily.sunrise ? daily.sunrise.slice(0, 7) : [],
        sunset: daily.sunset ? daily.sunset.slice(0, 7) : [],
      },
      hourly: hourly,
    };

    weatherCache[city.id] = weather;
    return weather;
  }

  async function getWeatherForCity(city) {
    weatherLoading.style.display = "block";
    weatherLoading.innerHTML = buildDetailSkeleton();
    weatherInfo.style.display = "none";
    weatherError.style.display = "none";
    forecastContainer.style.display = "none";
    hourlyContainer.style.display = "none";

    if (weatherCache[city.id] && weatherCache[city.id].hourly) {
      const cached = weatherCache[city.id];
      applyDetailBackground(cached.code);
      updateDetailWeatherUI(cached);
      renderForecast(cached.fullForecast, city.id);
      weatherLoading.style.display = "none";
      return;
    }

    try {
      const weather = await fetchWeather(city);
      applyDetailBackground(weather.code);
      updateDetailWeatherUI(weather);
      renderForecast(weather.fullForecast, city.id);
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen: ", error);
      weatherLoading.style.display = "none";
      weatherError.style.display = "block";
    }
  }

  // Baut das Skeleton-Markup für die Detail-Wetteransicht.
  function buildDetailSkeleton() {
    return `
      <div class="wx-skeleton">
        <div class="sk-row sk-main">
          <div class="sk-circle"></div>
          <div class="sk-temp"></div>
        </div>
        <div class="sk-grid">
          <div class="sk-tile"></div><div class="sk-tile"></div>
          <div class="sk-tile"></div><div class="sk-tile"></div>
        </div>
      </div>`;
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

  // Ordnet WMO-Codes einem animierten Hintergrund-Typ zu.
  function getWeatherAnimType(code) {
    if ([0, 1].includes(code)) return "clear";
    if ([2].includes(code)) return "partly";
    if ([3].includes(code)) return "cloudy";
    if ([45, 48].includes(code)) return "fog";
    if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) return "rain";
    if ([71, 73, 75].includes(code)) return "snow";
    if ([82, 95, 96, 99].includes(code)) return "thunder";
    return "clear";
  }

  // Baut die animierte Wetter-Szene als DOM-Schicht hinter dem Inhalt auf.
  function applyDetailBackground(code) {
    const isLight = document.body.classList.contains("light-mode");
    const isNight =
      activeCity &&
      weatherCache[activeCity.id] &&
      isNightTime(
        weatherCache[activeCity.id].sunrise,
        weatherCache[activeCity.id].sunset,
        activeCity.timezone,
      );
    const type = getWeatherAnimType(code);

    // Vorhandene Bild-Hintergründe entfernen (wir nutzen jetzt Animation)
    overlay.style.backgroundImage = "";

    // Animations-Layer holen oder erstellen
    let scene = document.getElementById("weather-scene");
    if (!scene) {
      scene = document.createElement("div");
      scene.id = "weather-scene";
      scene.className = "weather-scene";
      overlay.insertBefore(scene, overlay.firstChild);
    }

    // Reset
    scene.className = "weather-scene";
    scene.innerHTML = "";
    scene.classList.add(`scene-${type}`);
    if (isNight) scene.classList.add("scene-night");
    if (isLight) scene.classList.add("scene-light");

    buildSceneElements(scene, type, isNight);

    const detailContent = document.querySelector(".detail-content");
    if (detailContent) detailContent.style.color = isLight ? "#111" : "#fff";
  }

  // Erzeugt die einzelnen animierten Partikel/Objekte je nach Wettertyp.
  function buildSceneElements(scene, type, isNight) {
    const frag = document.createDocumentFragment();

    if (type === "clear" && !isNight) {
      const sun = document.createElement("div");
      sun.className = "anim-sun";
      sun.innerHTML =
        '<div class="sun-core"></div><div class="sun-rays"></div>';
      frag.appendChild(sun);
    }

    if (type === "clear" && isNight) {
      const moon = document.createElement("div");
      moon.className = "anim-moon";
      frag.appendChild(moon);
      for (let i = 0; i < 40; i++) {
        const star = document.createElement("div");
        star.className = "anim-star";
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 60 + "%";
        star.style.animationDelay = Math.random() * 3 + "s";
        star.style.setProperty("--star-size", Math.random() * 2 + 1 + "px");
        frag.appendChild(star);
      }
    }

    if (type === "partly") {
      if (!isNight) {
        const sun = document.createElement("div");
        sun.className = "anim-sun small";
        sun.innerHTML =
          '<div class="sun-core"></div><div class="sun-rays"></div>';
        frag.appendChild(sun);
      } else {
        const moon = document.createElement("div");
        moon.className = "anim-moon";
        frag.appendChild(moon);
      }
      addClouds(frag, 3);
    }

    if (type === "cloudy" || type === "fog") {
      addClouds(frag, type === "fog" ? 5 : 4);
    }

    if (type === "fog") {
      for (let i = 0; i < 4; i++) {
        const f = document.createElement("div");
        f.className = "anim-fog";
        f.style.top = 15 + i * 20 + "%";
        f.style.animationDuration = 18 + i * 4 + "s";
        f.style.animationDelay = i * -5 + "s";
        frag.appendChild(f);
      }
    }

    if (type === "rain" || type === "thunder") {
      addClouds(frag, 4, true);
      const rain = document.createElement("div");
      rain.className = "anim-rain";
      for (let i = 0; i < 60; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = Math.random() * 100 + "%";
        drop.style.animationDuration = 0.5 + Math.random() * 0.4 + "s";
        drop.style.animationDelay = Math.random() * 2 + "s";
        drop.style.opacity = 0.3 + Math.random() * 0.5;
        rain.appendChild(drop);
      }
      frag.appendChild(rain);
    }

    if (type === "thunder") {
      const flash = document.createElement("div");
      flash.className = "anim-lightning";
      frag.appendChild(flash);
    }

    if (type === "snow") {
      addClouds(frag, 3, true);
      const snow = document.createElement("div");
      snow.className = "anim-snow";
      for (let i = 0; i < 50; i++) {
        const flake = document.createElement("div");
        flake.className = "snow-flake";
        flake.textContent = "❄";
        flake.style.left = Math.random() * 100 + "%";
        flake.style.fontSize = Math.random() * 10 + 8 + "px";
        flake.style.animationDuration = 4 + Math.random() * 5 + "s";
        flake.style.animationDelay = Math.random() * 5 + "s";
        flake.style.opacity = 0.4 + Math.random() * 0.5;
        snow.appendChild(flake);
      }
      frag.appendChild(snow);
    }

    scene.appendChild(frag);
  }

  function addClouds(frag, count, dark) {
    for (let i = 0; i < count; i++) {
      const cloud = document.createElement("div");
      cloud.className = "anim-cloud" + (dark ? " dark" : "");
      cloud.style.top = 8 + i * 14 + "%";
      cloud.style.setProperty("--cloud-scale", 0.7 + Math.random() * 0.8);
      cloud.style.animationDuration = 30 + Math.random() * 30 + "s";
      cloud.style.animationDelay = i * -8 + "s";
      frag.appendChild(cloud);
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
    weatherEl.className = "card-weather is-loading";
    weatherEl.innerHTML = `
      <div class="card-weather-icon"><span class="sk-mini-circle"></span></div>
      <div class="card-weather-info">
        <div class="card-weather-temp"><span class="sk-bar sk-bar-temp"></span></div>
        <div class="card-weather-desc"><span class="sk-bar sk-bar-desc"></span></div>
      </div>`;

    const forecastEl = document.createElement("div");
    forecastEl.className = "card-forecast is-loading";
    forecastEl.innerHTML = `
      <div class="card-forecast-day"><span class="sk-bar sk-bar-sm"></span><span class="sk-mini-circle sm"></span><span class="sk-bar sk-bar-sm"></span></div>
      <div class="card-forecast-day"><span class="sk-bar sk-bar-sm"></span><span class="sk-mini-circle sm"></span><span class="sk-bar sk-bar-sm"></span></div>
      <div class="card-forecast-day"><span class="sk-bar sk-bar-sm"></span><span class="sk-mini-circle sm"></span><span class="sk-bar sk-bar-sm"></span></div>`;

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
      maybeUpdateHeroMood(city.id);
      return;
    }
    try {
      const weather = await fetchWeather(city);
      updateCardWeatherUI(city.id, weather);
      updateWeatherStats();
      maybeUpdateHeroMood(city.id);
    } catch (error) {
      console.warn("Wetter für " + city.name + " fehlgeschlagen: ", error);
    }
  }

  // ===== DYNAMISCHER HERO-HINTERGRUND =====
  const LAST_CITY_KEY = "weltinfos_last_city";
  let heroMoodApplied = false;

  // Wählt die "Leitstadt" für die Hero-Stimmung: erst zuletzt besuchte,
  // sonst erster Favorit.
  function heroLeadCityId() {
    const last = localStorage.getItem(LAST_CITY_KEY);
    if (last && weatherCache[last]) return last;
    for (const id of favorites) if (weatherCache[id]) return id;
    return null;
  }

  function maybeUpdateHeroMood(justLoadedId) {
    const lead = heroLeadCityId();
    if (!lead) return;
    // Nur neu setzen, wenn die gerade geladene Stadt die Leitstadt ist
    // oder noch keine Stimmung gesetzt wurde.
    if (justLoadedId && justLoadedId !== lead && heroMoodApplied) return;
    const w = weatherCache[lead];
    if (!w) return;
    applyHeroMood(w.code, w.isNight);
    heroMoodApplied = true;
  }

  // Setzt CSS-Variablen für den Hero-Verlauf je nach Wetterlage.
  function applyHeroMood(code, isNight) {
    const type = getWeatherAnimType(code);
    const moods = {
      clear: ["#0d3b2e", "#0a4d5c", "#13694f"],
      partly: ["#0d3b2e", "#234b5c", "#1c5e6e"],
      cloudy: ["#1f2933", "#33414d", "#26323c"],
      fog: ["#2a2f33", "#3a4248", "#2f363b"],
      rain: ["#10212e", "#143b4d", "#1d4b63"],
      snow: ["#1b2733", "#2e4456", "#3a5872"],
      thunder: ["#241a2e", "#3a2350", "#23103b"],
    };
    const nightMoods = {
      clear: ["#080d1a", "#0d1b3a", "#101d44"],
      partly: ["#0a0f1e", "#15213d", "#1a2647"],
      cloudy: ["#0c0f14", "#1a212b", "#141a22"],
      fog: ["#10131a", "#1c222b", "#161b22"],
      rain: ["#070f18", "#0d2233", "#123047"],
      snow: ["#0a121c", "#16263a", "#1d3350"],
      thunder: ["#140c1e", "#241338", "#15082b"],
    };
    const pick = (isNight ? nightMoods : moods)[type] || moods.clear;
    const hero = document.getElementById("welcome-hero");
    if (!hero) return;
    hero.style.setProperty("--mood-1", pick[0]);
    hero.style.setProperty("--mood-2", pick[1]);
    hero.style.setProperty("--mood-3", pick[2]);
    hero.classList.add("mood-active");
    hero.dataset.mood = type;
  }

  function updateCardWeatherUI(cityId, weather) {
    const cardData = cityCards[cityId];
    if (!cardData) return;
    cardData.weatherEl.classList.remove("is-loading");
    cardData.forecastEl.classList.remove("is-loading");
    const uvColor = getUvColor(weather.uvIndex);
    cardData.weatherEl.innerHTML = `
      <div class="card-weather-icon">${svgWeatherIcon(weather.code, weather.isNight, 1)}</div>
      <div class="card-weather-info">
        <div class="card-weather-temp">${fmtTemp(weather.temp)}</div>
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
          <div class="card-forecast-icon">${svgWeatherIcon(day.code, false, 0.8)}</div>
          <div class="card-forecast-temp">${fmtTemp(day.max, false)} <span>/${fmtTemp(day.min, false)}</span></div>
        </div>`,
      )
      .join("");

    // Warn-Rahmen auf der Karte
    cardData.card.classList.remove("card-alert-warn", "card-alert-severe");
    if (weather.alert) {
      cardData.card.classList.add("card-alert-" + weather.alert.level);
      cardData.card.setAttribute("title", weather.alert.label);
    } else {
      cardData.card.removeAttribute("title");
    }
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

    // 1. Fokus und Cursor-Position merken, bevor wir das DOM umbauen
    const isFocused = document.activeElement === searchInput;
    let cursorPos = 0;
    if (isFocused) {
      cursorPos = searchInput.selectionStart;
    }

    // 2. Suchleiste verschieben (Nur wenn nötig, um unnötige DOM-Updates zu vermeiden)
    if (term === "") {
      const wOverview = document.querySelector(".welcome-weather-overview");
      if (sWrapper && wOverview && sWrapper.parentNode !== wOverview) {
        wOverview.appendChild(sWrapper);
      }
      if (statusMessage.parentElement !== welcomeHero) {
        welcomeHero.appendChild(statusMessage);
      }
    } else {
      if (sWrapper && welcomeHero && sWrapper.nextSibling !== welcomeHero) {
        welcomeHero.parentNode.insertBefore(sWrapper, welcomeHero);
      }
      if (statusMessage.parentElement === welcomeHero) {
        welcomeHero.parentNode.insertBefore(
          statusMessage,
          welcomeHero.nextSibling,
        );
      }
    }

    // 3. Fokus und Cursor sofort wiederherstellen!
    if (isFocused) {
      setTimeout(() => {
        searchInput.focus();
        searchInput.setSelectionRange(cursorPos, cursorPos);
      }, 0);
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
    localStorage.setItem(LAST_CITY_KEY, city.id);
    heroMoodApplied = false;
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
    const scene = document.getElementById("weather-scene");
    if (scene) scene.innerHTML = "";
    document.body.style.overflow = "";
    activeCity = null;
    hourlyContainer.style.display = "none";
    heroMoodApplied = false;
    maybeUpdateHeroMood(null);
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
    weatherIcon.innerHTML = svgWeatherIcon(w.code, w.isNight, 1);
    weatherTemp.textContent = fmtTemp(w.temp);

    // Windrichtung als Pfeil/Kompass
    const windDirTxt = w.windDir != null ? " " + degToCompass(w.windDir) : "";

    // Kachel-Raster mit den Detailwerten
    const tiles = `
      <div class="wx-detail-grid">
        <div class="wx-tile">
          <div class="wx-tile-icon">🌡️</div>
          <div class="wx-tile-label">Gefühlt</div>
          <div class="wx-tile-value">${w.apparent != null ? fmtTemp(w.apparent) : "–"}</div>
        </div>
        <div class="wx-tile">
          <div class="wx-tile-icon" style="color:${uvColor}">☀️</div>
          <div class="wx-tile-label">UV-Index</div>
          <div class="wx-tile-value" style="color:${uvColor}">${w.uvIndex != null ? w.uvIndex : "–"}</div>
        </div>
        <div class="wx-tile">
          <div class="wx-tile-icon">💧</div>
          <div class="wx-tile-label">Luftfeuchte</div>
          <div class="wx-tile-value">${w.humidity != null ? w.humidity + "%" : "–"}</div>
        </div>
        <div class="wx-tile">
          <div class="wx-tile-icon">💨</div>
          <div class="wx-tile-label">Wind</div>
          <div class="wx-tile-value">${w.wind != null ? w.wind + " km/h" + windDirTxt : "–"}</div>
        </div>
      </div>`;

    weatherDesc.innerHTML = `<div class="wx-desc-text">${w.desc}</div>${tiles}`;

    // Unwetterwarnung farblich hervorheben
    const detailWeather = document.querySelector(".detail-weather");
    let alertBox = document.getElementById("wx-alert");
    if (w.alert) {
      if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "wx-alert";
        detailWeather.parentNode.insertBefore(alertBox, detailWeather);
      }
      alertBox.className = "wx-alert wx-alert-" + w.alert.level;
      alertBox.innerHTML = `<span class="wx-alert-icon">${w.alert.icon}</span><span class="wx-alert-text">${w.alert.label}</span>`;
      alertBox.style.display = "flex";
      detailWeather.classList.add("has-alert", "alert-" + w.alert.level);
    } else {
      if (alertBox) alertBox.style.display = "none";
      detailWeather.classList.remove("has-alert", "alert-warn", "alert-severe");
    }

    // Wochen-Temperaturkurve
    if (w.fullForecast) renderTempChart(w.fullForecast);

    // Startet die neue Sonnen-Mond-Animation
    if (activeCity) {
      updateSunMoonTracker(w.sunrise, w.sunset, activeCity.timezone);
    }
  }

  function degToCompass(deg) {
    const dirs = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  // ===== WOCHEN-TEMPERATURKURVE (SVG-Liniendiagramm) =====
  function renderTempChart(fc) {
    const container = document.getElementById("temp-chart-container");
    if (!container) return;
    const maxArr = fc.max,
      minArr = fc.min,
      timeArr = fc.time;
    if (!maxArr || maxArr.length < 2) {
      container.style.display = "none";
      return;
    }
    container.style.display = "block";

    const W = 320,
      H = 150,
      padX = 26,
      padTop = 24,
      padBottom = 28;
    const n = maxArr.length;
    const allVals = [...maxArr, ...minArr];
    let lo = Math.min(...allVals),
      hi = Math.max(...allVals);
    if (lo === hi) {
      lo -= 1;
      hi += 1;
    }
    const span = hi - lo;
    const xAt = (i) => padX + (i * (W - 2 * padX)) / (n - 1);
    const yAt = (v) =>
      padTop + (1 - (v - lo) / span) * (H - padTop - padBottom);

    const linePath = (arr) =>
      arr
        .map(
          (v, i) =>
            `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`,
        )
        .join(" ");
    const areaPath =
      `M${xAt(0).toFixed(1)},${yAt(maxArr[0]).toFixed(1)} ` +
      maxArr
        .map((v, i) => `L${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`)
        .join(" ") +
      ` L${xAt(n - 1).toFixed(1)},${(H - padBottom).toFixed(1)} L${xAt(0).toFixed(1)},${(H - padBottom).toFixed(1)} Z`;

    const dayLabels = timeArr
      .map((d, i) => {
        const name = new Date(d).toLocaleDateString("de-DE", {
          weekday: "short",
        });
        return `<text x="${xAt(i).toFixed(1)}" y="${H - 8}" class="tc-axis" text-anchor="middle">${name}</text>`;
      })
      .join("");

    const maxPoints = maxArr
      .map(
        (v, i) =>
          `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="3" class="tc-dot-max"/>` +
          `<text x="${xAt(i).toFixed(1)}" y="${(yAt(v) - 7).toFixed(1)}" class="tc-val tc-val-max" text-anchor="middle">${convTemp(v)}°</text>`,
      )
      .join("");
    const minPoints = minArr
      .map(
        (v, i) =>
          `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="2.5" class="tc-dot-min"/>` +
          `<text x="${xAt(i).toFixed(1)}" y="${(yAt(v) + 14).toFixed(1)}" class="tc-val tc-val-min" text-anchor="middle">${convTemp(v)}°</text>`,
      )
      .join("");

    container.querySelector(".temp-chart-svg-wrap").innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" class="temp-chart-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tcArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#tcArea)"/>
        <path d="${linePath(minArr)}" class="tc-line tc-line-min"/>
        <path d="${linePath(maxArr)}" class="tc-line tc-line-max"/>
        ${minPoints}
        ${maxPoints}
        ${dayLabels}
      </svg>`;
  }

  function renderForecast(forecast, cityId) {
    forecastScroll.innerHTML = "";
    const days = forecast.time;
    const codes = forecast.weathercode;
    const maxTemps = forecast.max;
    const minTemps = forecast.min;
    for (let i = 0; i < days.length; i++) {
      const date = days[i];
      const dayName = new Date(date).toLocaleDateString("de-DE", {
        weekday: "short",
      });
      const icon = svgWeatherIcon(codes[i], false, 1.1);
      const max = Math.round(maxTemps[i]);
      const min = Math.round(minTemps[i]);

      const el = document.createElement("div");
      el.className = "forecast-day";
      el.dataset.date = date;
      el.innerHTML = `
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="forecast-temps"><span>${fmtTemp(max, false)}</span> <span>/${fmtTemp(min, false)}</span></div>`;
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
        const precipProb =
          hourly.precipitation_probability &&
          hourly.precipitation_probability[i] != null
            ? Math.round(hourly.precipitation_probability[i])
            : null;

        const isNightHour = isNightTimeForHour(timeStr, sunrise, sunset);
        const icon = svgWeatherIcon(wCode, isNightHour, 0.95);

        // Farbabstufung der Regenwahrscheinlichkeit
        let precipClass = "low";
        if (precipProb != null) {
          if (precipProb >= 70) precipClass = "high";
          else if (precipProb >= 30) precipClass = "mid";
        }

        const el = document.createElement("div");
        el.className = "hourly-item";
        if (isToday && hour === nowHour) el.classList.add("current");
        el.innerHTML = `
          <div class="hourly-hour">${String(hour).padStart(2, "0")}:00</div>
          <div class="hourly-icon">${icon}</div>
          <div class="hourly-temp">${fmtTemp(temp, false)}</div>
          <div class="hourly-precip ${precipClass}">
            <span class="precip-drop">💧</span>${precipProb != null ? precipProb + "%" : "–"}
          </div>`;
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

  // ===== EINHEITEN-TOGGLE (°C / °F) =====
  const unitBtn = document.getElementById("unit-toggle");
  if (unitBtn) {
    const renderUnitBtn = () => {
      unitBtn.innerHTML = `<span class="${tempUnit === "C" ? "active" : ""}">°C</span><span class="${tempUnit === "F" ? "active" : ""}">°F</span>`;
    };
    renderUnitBtn();
    unitBtn.addEventListener("click", () => {
      tempUnit = tempUnit === "C" ? "F" : "C";
      localStorage.setItem(UNIT_KEY, tempUnit);
      renderUnitBtn();
      // Alle bereits geladenen Karten neu zeichnen
      Object.keys(weatherCache).forEach((id) => {
        if (cityCards[id]) updateCardWeatherUI(id, weatherCache[id]);
      });
      // Offene Detailansicht aktualisieren
      if (activeCity && weatherCache[activeCity.id]) {
        const w = weatherCache[activeCity.id];
        updateDetailWeatherUI(w);
        renderForecast(w.fullForecast, activeCity.id);
        // ggf. geöffnete Stundenansicht neu zeichnen
        const sel = document.querySelector(".forecast-day.selected");
        if (sel) showHourlyForecast(activeCity.id, sel.dataset.date, sel);
      }
    });
  }

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
  // ===== SONNEN-/MOND-VERLAUF =====
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

  // ===== MODAL-LOGIK FÜR IMPRESSUM & DATENSCHUTZ =====
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
