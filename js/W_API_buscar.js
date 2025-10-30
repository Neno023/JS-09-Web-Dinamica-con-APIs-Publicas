// W_API_buscar.js

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('ciudad');
  const suggestionsList = document.getElementById('suggestions');
  const searchForm = document.getElementById('searchForm');
  const autoWrapper = searchInput.closest('.autocomplete'); // wrapper del input + lista + icon-button

  // Tu API Key
  const apiKey = '579d8622c67f62745e2dc1592a37b897';

  let debounceTimer;
  let lastQuery = '';

  const clearSuggestions = () => {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    searchInput.setAttribute('aria-expanded', 'false');
  };

  const showSuggestions = () => {
    suggestionsList.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');
  };

  // Construye el <li> de acción "Buscar 'query'"
  const buildSearchActionItem = (query) => {
    const action = document.createElement('li');
    action.className = 'action';
    action.role = 'option';
    action.dataset.action = 'submit';
    const safe = query || '';
    action.textContent = safe ? `Buscar “${safe}”` : 'Buscar';
    action.addEventListener('click', () => {
      // Enviar el form (misma lógica que el botón)
      searchForm.requestSubmit();
    });
    return action;
  };

  // Muestra ciudades + último <li> de acción
  const displaySuggestions = (cities) => {
    suggestionsList.innerHTML = '';

    // Si no hay nada útil, limpiar
    if (!Array.isArray(cities)) { clearSuggestions(); return; }

    // Mostrar lista
    showSuggestions();

    // Agregar ciudades
    cities.forEach((city, index) => {
      const li = document.createElement('li');
      const state = city.state ? `, ${city.state}` : '';
      li.textContent = `${city.name}, ${city.country}${state}`;
      li.dataset.lat = city.lat;
      li.dataset.lon = city.lon;
      li.role = 'option';
      li.id = `suggestion-${index}`;

      li.addEventListener('click', () => {
        window.location.href = `climainfo.html?lat=${city.lat}&lon=${city.lon}`;
      });

      suggestionsList.appendChild(li);
    });

    // Agregar el item de acción al final (tipo Google)
    suggestionsList.appendChild(buildSearchActionItem(lastQuery));
  };

  // Petición de sugerencias
  const getCitySuggestions = async (query) => {
    lastQuery = query;

    if (query.length < 3) {
      clearSuggestions();
      return;
    }

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

  // Input con debounce
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    debounceTimer = setTimeout(() => {
      getCitySuggestions(query);
    }, 300);
  });

  // Cerrar si se hace clic fuera del wrapper
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete')) {
      clearSuggestions();
    }
  });

  // Submit del formulario
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Preferencia: si el usuario seleccionó una ciudad de la lista, ya redirigió por click.
    // Aquí: si hay sugerencias, toma la primera ciudad; si no, ve por query libre.
    const firstCity = suggestionsList.querySelector('li:not(.action)');

    if (firstCity && firstCity.dataset.lat && firstCity.dataset.lon) {
      // Simula el click de la primera ciudad
      firstCity.click();
      return;
    }

    // Si no hay sugerencias de ciudad, redirige con query
    const q = searchInput.value.trim();
    window.location.href = q
      ? `climainfo.html?q=${encodeURIComponent(q)}`
      : `climainfo.html`;
  });

  // Accesibilidad extra
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearSuggestions();
    }
  });

  searchInput.addEventListener('focus', () => {
    if (suggestionsList.children.length > 0) {
      showSuggestions();
    }
  });
});
