document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('ciudad');
    const suggestionsList = document.getElementById('suggestions');
    const searchForm = document.getElementById('searchForm');
    
    // Tu API Key
    const apiKey = '579d8622c67f62745e2dc1592a37b897'; 

    let debounceTimer;

    // Función para obtener sugerencias de ciudades
    const getCitySuggestions = async (query) => {
        if (query.length < 3) { // No buscar hasta que haya al menos 3 caracteres
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none'; // <-- AÑADIDO: Oculta la lista
            return;
        }

        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;

        try {
            const response = await fetch(url);
            const cities = await response.json();
            displaySuggestions(cities);
        } catch (error) {
            console.error('Error al obtener sugerencias:', error);
        }
    };

    // Función para mostrar las sugerencias en la lista
    const displaySuggestions = (cities) => {
        suggestionsList.innerHTML = ''; // Limpiar sugerencias anteriores
        if (cities.length === 0) {
            suggestionsList.style.display = 'none'; // <-- AÑADIDO: Oculta si no hay resultados
            return;
        }

        suggestionsList.style.display = 'block'; // <-- AÑADIDO: Muestra la lista si hay resultados

        cities.forEach(city => {
            const li = document.createElement('li');
            const state = city.state ? `, ${city.state}` : '';
            li.textContent = `${city.name}, ${city.country}${state}`;
            
            li.dataset.lat = city.lat;
            li.dataset.lon = city.lon;
            
            li.addEventListener('click', () => {
                window.location.href = `climainfo.html?lat=${city.lat}&lon=${city.lon}`;
            });

            suggestionsList.appendChild(li);
        });
    };

    // Evento 'input' para detectar cuando el usuario escribe
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();
        
        debounceTimer = setTimeout(() => {
            getCitySuggestions(query);
        }, 300);
    });

    // Cerrar sugerencias si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.suggestions-container')) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none'; // <-- AÑADIDO: Oculta la lista
        }
    });

    // Evitar que el formulario se envíe de la forma tradicional
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstSuggestion = suggestionsList.querySelector('li');
        if (firstSuggestion) {
            firstSuggestion.click();
        } else {
            window.location.href = `climainfo.html?q=${encodeURIComponent(searchInput.value)}`;
        }
    });
});