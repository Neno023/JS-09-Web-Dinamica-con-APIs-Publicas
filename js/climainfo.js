// ==================== CONFIGURACIÓN Y SELECTOR ====================
const apiKey = '579d8622c67f62745e2dc1592a37b897'; 
const $ = (sel) => document.querySelector(sel);

// ==================== FUNCIONES DE UTILIDAD ====================
function toOneLine(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function saveForRecs(payload) {
  try {
    sessionStorage.setItem('climon.rec', JSON.stringify(payload));
  } catch {}

  const link = document.getElementById('recomLink');
  if (link) {
    const qp = new URLSearchParams({
      city: payload.city || '',
      desc: payload.desc || '',
      temp: String(payload.temp ?? ''),
      feels: String(payload.feels ?? ''),
      hum: String(payload.hum ?? ''),
      wind: String(payload.wind ?? '')
    });
    link.href = `sugerencias.html?${qp.toString()}`;
  }
}

// ==================== INICIALIZACIÓN Y EVENTOS ====================
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lon = urlParams.get('lon');
  const cityFromURL = urlParams.get('q');

  if (lat && lon) {
    getWeatherByCoords(lat, lon);
  } else if (cityFromURL) {
    $('#cityInput').value = cityFromURL;
    getWeatherByCityName(cityFromURL);
  } else {
    const link = document.getElementById('recomLink');
    if (link) link.href = 'sugerencias.html';
  }

  const formEl = $('#searchForm');
  const inputEl = $('#cityInput');
  const listEl = $('#ciSuggestions');
  let debounceTimer;
  let lastQuery = '';

  const clearSuggestions = () => {
    listEl.innerHTML = '';
    listEl.style.display = 'none';
    inputEl.setAttribute('aria-expanded', 'false');
  };

  const showSuggestions = () => {
    listEl.style.display = 'block';
    inputEl.setAttribute('aria-expanded', 'true');
  };

  const buildSearchActionItem = (query) => {
    const action = document.createElement('li');
    action.className = 'action';
    action.role = 'option';
    action.dataset.action = 'submit';
    const safe = query || '';
    action.textContent = safe ? `Buscar “${safe}”` : 'Buscar';
    action.addEventListener('click', () => {
      formEl.requestSubmit();
    });
    return action;
  };

  const displaySuggestions = (cities) => {
    listEl.innerHTML = '';
    if (!Array.isArray(cities)) { clearSuggestions(); return; }
    showSuggestions();
    cities.forEach((city, index) => {
      const li = document.createElement('li');
      const state = city.state ? `, ${city.state}` : '';
      li.textContent = `${city.name}, ${city.country}${state}`;
      li.dataset.lat = city.lat;
      li.dataset.lon = city.lon;
      li.role = 'option';
      li.id = `suggestion-${index}`;
      li.addEventListener('click', () => {
        window.history.pushState({}, '', `climainfo.html?lat=${city.lat}&lon=${city.lon}`);
        getWeatherByCoords(city.lat, city.lon);
        clearSuggestions();
        inputEl.value = `${city.name}`;
      });
      listEl.appendChild(li);
    });
    listEl.appendChild(buildSearchActionItem(lastQuery));
  };

  const getCitySuggestions = async (query) => {
    lastQuery = query;
    if (query.length < 3) { clearSuggestions(); return; }
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    try {
      const response = await fetch(url);
      const cities = await response.json();
      displaySuggestions(cities);
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      clearSuggestions();
    }
  };

  inputEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = inputEl.value.trim();
    debounceTimer = setTimeout(() => {
      getCitySuggestions(query);
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete')) {
      clearSuggestions();
    }
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstCity = listEl.querySelector('li:not(.action)');
    if (firstCity && firstCity.dataset.lat && firstCity.dataset.lon) {
      firstCity.click();
      return;
    }
    const city = inputEl.value.trim();
    if (city) {
      window.history.pushState({}, '', `climainfo.html?q=${encodeURIComponent(city)}`);
      getWeatherByCityName(city);
      clearSuggestions();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearSuggestions();
    }
  });

  inputEl.addEventListener('focus', () => {
    if (listEl.children.length > 0) {
      showSuggestions();
    }
  });
});

$('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const city = $('#cityInput').value.trim();
    if (city) {
        window.history.pushState({}, '', `climainfo.html?q=${encodeURIComponent(city)}`);
        getWeatherByCityName(city);
    }
});

// ==================== FUNCIONES DE ORQUESTACIÓN (EN PARALELO) ====================
async function getWeatherByCoords(lat, lon) {
    await Promise.all([
        getCurrentWeather(null, lat, lon),
        getForecast(null, lat, lon),
        getWeatherMap(null, lat, lon)
    ]);
}

async function getWeatherByCityName(city) {
    await Promise.all([
        getCurrentWeather(city, null, null),
        getForecast(city, null, null),
        getWeatherMap(city, null, null)
    ]);
}

// ==================== FUNCIONES PRINCIPALES (API) ====================
async function getCurrentWeather(city, lat, lon) {
    const url = lat && lon 
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
  
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.name) {
             $('#cityInput').value = data.name;
        }

        if (+data.cod === 200) {
            const icon = `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon || '01d'}@2x.png`;
            $('#cityName').textContent = `${data.name}, ${data.sys.country}`;
            $('#temp').textContent = `${Math.round(data.main.temp)}°C`;
            $('#weatherIcon').src = icon;
            $('#weatherIcon').alt = data.weather?.[0]?.description || 'Clima';
            $('#description').textContent = data.weather?.[0]?.description || '';

            $('#extras').innerHTML = `
                <div class="extra"><span>Sensación</span><strong>${Math.round(data.main.feels_like)}°C</strong></div>
                <div class="extra"><span>Humedad</span><strong>${data.main.humidity}%</strong></div>
                <div class="extra"><span>Viento</span><strong>${data.wind.speed} m/s</strong></div>
            `;

            saveForRecs({
              city: `${data.name}, ${data.sys.country}`,
              desc: toOneLine((data.weather?.[0]?.description || '').toLowerCase()),
              temp: Math.round(data.main.temp),
              feels: Math.round(data.main.feels_like),
              hum: data.main.humidity,
              wind: data.wind.speed
            });
        } else {
            $('#cityName').textContent = 'Ciudad no encontrada';
            $('#temp').textContent = '--°C';
            $('#description').textContent = '';
            $('#extras').innerHTML = '';
            const link = document.getElementById('recomLink');
            if (link) link.href = 'sugerencias.html';
        }
    } catch (e) {
        console.error('Error clima actual', e);
        const link = document.getElementById('recomLink');
        if (link) link.href = 'sugerencias.html';
    }
}

async function getForecast(city, lat, lon) {
    const url = lat && lon
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.cod === "200") {
            renderHourly(data.list);
            renderDaily(data.list);
        } else {
            $('#hourlyForecast').innerHTML = '';
            $('#dailyForecast').innerHTML = '';
        }
    } catch (e) {
        console.error('Error pronóstico', e);
    }
}

async function getWeatherMap(city, lat, lon) {
  let finalLat = lat;
  let finalLon = lon;

  if (!finalLat || !finalLon) {
      try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`);
          const data = await res.json();
          if (data.coord) {
              finalLat = data.coord.lat;
              finalLon = data.coord.lon;
          }
      } catch (e) {
          console.error('Error mapa', e);
          $('#mapResult').innerHTML = '';
          return;
      }
  }

  if (finalLat && finalLon) {
      $('#mapResult').innerHTML = `
        <h3 class="section-title">Mapa meteorológico</h3>
        <div class="map-frame">
          <iframe
            src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=clouds&lat=${finalLat}&lon=${finalLon}&zoom=7"
            width="100%" height="420" style="border:0;border-radius:12px"
            loading="lazy" referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>`;
  } else {
      $('#mapResult').innerHTML = '';
  }
}

// ==================== FUNCIONES DE RENDERIZADO (SIN CAMBIOS) ====================
function renderHourly(list) {
  const hourly = $('#hourlyForecast');
  hourly.innerHTML = '';
  list.slice(0, 8).forEach(item => {
    const dt = new Date(item.dt * 1000);
    const hour = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

    hourly.insertAdjacentHTML('beforeend', `
      <article class="card-mini" role="listitem" aria-label="${hour}">
        <small class="card-mini__time">${hour}</small>
        <img src="${icon}" alt="${item.weather[0].description}" width="48" height="48" loading="lazy">
        <div class="card-mini__temp">${Math.round(item.main.temp)}°C</div>
      </article>
    `);
  });
}

function renderDaily(list) {
  const daily = $('#dailyForecast');
  daily.innerHTML = '';
  const grouped = new Map();

  list.forEach(item => {
    const key = new Date(item.dt * 1000).toLocaleDateString('es-MX', { weekday: 'long' });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  Array.from(grouped.entries()).slice(0, 5).forEach(([day, values]) => {
    const temps = values.map(v => v.main.temp);
    const tmin = Math.round(Math.min(...temps));
    const tmax = Math.round(Math.max(...temps));
    const mid = values[Math.floor(values.length / 2)];
    const icon = `https://openweathermap.org/img/wn/${mid.weather[0].icon}.png`;

    daily.insertAdjacentHTML('beforeend', `
      <article class="card-day" role="listitem" aria-label="${day}">
        <small class="card-day__name text-capitalize">${day}</small>
        <img src="${icon}" alt="${mid.weather[0].description}" width="56" height="56" loading="lazy">
        <div class="card-day__temps">
          <span class="max">${tmax}°</span>
          <span class="min">${tmin}°</span>
        </div>
      </article>
    `);
  });
}
