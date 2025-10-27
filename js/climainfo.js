// ==================== CONFIGURACIÓN ====================
const apiKey = '579d8622c67f62745e2dc1592a37b897';
const $ = (sel) => document.querySelector(sel);

// ==================== EVENTOS ====================
// Buscar al enviar el formulario
$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  getWeather();
  const q = $('#cityInput').value.trim();
  if (q) {
    const url = new URL(window.location);
    url.searchParams.set('q', q);
    window.history.replaceState({}, '', url);
  }
});

// Cargar automáticamente si hay ?q=
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const cityFromURL = params.get('q');
  if (cityFromURL) {
    $('#cityInput').value = cityFromURL;
    getWeather(cityFromURL);
  }
});

// ==================== UTILIDADES ====================
function toOneLine(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

// Guarda payload para sugerencias y actualiza el link
function saveForRecs(payload) {
  try { sessionStorage.setItem('climon.rec', JSON.stringify(payload)); } catch {}
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

// ==================== FUNCIONES PRINCIPALES ====================
async function getWeather(cityParam) {
  const city = cityParam || $('#cityInput').value.trim();
  if (!city) return;
  await getCurrentWeather(city);
  await getForecast(city);
  await getWeatherMap(city);
}

// ---- Clima actual ----
async function getCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
  try {
    const res = await fetch(url);
    const data = await res.json();

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

      // Guardar para Recomendaciones
      saveForRecs({
        city: `${data.name}, ${data.sys.country}`,
        desc: toOneLine(data.weather?.[0]?.description || ''),
        temp: Math.round(data.main.temp),
        feels: Math.round(data.main.feels_like),
        hum: data.main.humidity,
        wind: data.wind.speed
      });
    } else {
      $('#cityName').textContent = 'No encontrado';
      $('#temp').textContent = '--°C';
      $('#description').textContent = '';
      $('#extras').innerHTML = '';
      const link = document.getElementById('recomLink');
      if (link) link.href = 'sugerencias.html';
    }
  } catch (e) {
    console.error('Error clima actual', e);
  }
}

// ---- Pronóstico (5 días / cada 3 horas) ----
async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod === "200") {
      renderHourly(data.list);
      renderDaily(data.list);
    }
  } catch (e) {
    console.error('Error pronóstico', e);
  }
}

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

// ---- Mapa ----
async function getWeatherMap(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`);
    const data = await res.json();
    if (data.coord) {
      const { lat, lon } = data.coord;
      $('#mapResult').innerHTML = `
        <h3 class="section-title">Mapa meteorológico</h3>
        <div class="map-frame">
          <iframe
            src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=clouds&lat=${lat}&lon=${lon}&zoom=7"
            width="100%" height="420"
            style="border:0;border-radius:12px"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>`;
    }
  } catch (e) {
    console.error('Error mapa', e);
  }
}
