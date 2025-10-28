(function () {
  const climaElement = document.getElementById('tipo-clima');
  const actividadesContainer = document.getElementById('actividades-container');
  const ropaContainer = document.getElementById('ropa-container');

  // 1) Obtener datos del clima
  let desc = '';
  let climaData = {};

  // Intentar leer de la URL primero
  const params = new URLSearchParams(location.search);
  desc = params.get('desc') || '';
  
  // Si no viene en URL, leer de sessionStorage
  if (!desc) {
    try {
      const raw = sessionStorage.getItem('climon.rec');
      if (raw) {
        climaData = JSON.parse(raw);
        desc = climaData.desc || '';
      }
    } catch (e) {
      console.error('Error leyendo sessionStorage:', e);
    }
  }

  // 2) Determinar tipo de clima principal
  const tipoClima = determinarTipoClima(desc);
  climaElement.textContent = desc && desc.length ? desc : 'clima de tu ciudad';

  // 3) Generar recomendaciones dinámicas
  generarRecomendaciones(tipoClima);

  // ==================== FUNCIONES PRINCIPALES ====================

  function determinarTipoClima(descripcion) {
    const desc = descripcion.toLowerCase();
    
    // Cielo despejado
    if (desc.includes('cielo claro') || desc.includes('despejado')) return 'despejado';
    
    // Nubes
    if (desc.includes('pocas nubes') || desc.includes('nubes dispersas') || 
        desc.includes('muy nuboso') || desc.includes('nublado')) return 'nublado';
    
    // Lluvia
    if (desc.includes('lluvia') || desc.includes('chubascos') || desc.includes('llovizna')) {
      if (desc.includes('ligera') || desc.includes('leve')) return 'lluvia_ligera';
      return 'lluvia_fuerte';
    }
    
    // Tormentas
    if (desc.includes('tormenta')) return 'tormenta';
    
    // Nieve
    if (desc.includes('nieve') || desc.includes('nevada') || desc.includes('aguanieve')) return 'nieve';
    
    // Condiciones atmosféricas
    if (desc.includes('niebla') || desc.includes('bruma') || desc.includes('neblina')) return 'niebla';
    
    // Condiciones extremas
    if (desc.includes('tornado') || desc.includes('ceniza') || desc.includes('polvo')) return 'extremo';
    
    return 'despejado'; // Por defecto
  }

  function generarRecomendaciones(tipoClima) {
    const recomendaciones = obtenerRecomendacionesPorClima(tipoClima);
    
    // Generar actividades
    actividadesContainer.innerHTML = recomendaciones.actividades.map(act => `
      <div class="card">
        <img src="img/actividad${act.img}.png" alt="${act.titulo}">
        <h3>${act.titulo}</h3>
        <p>${act.descripcion}</p>
      </div>
    `).join('');

    // Generar ropa
    ropaContainer.innerHTML = recomendaciones.ropa.map(outfit => `
      <div class="card">
        <img src="img/ropa${outfit.img}.png" alt="${outfit.titulo}">
        <h3>${outfit.titulo}</h3>
        <p>${outfit.descripcion}</p>
      </div>
    `).join('');
  }

  function obtenerRecomendacionesPorClima(tipoClima) {
    const recomendaciones = {
      despejado: {
        actividades: [
          {
            img: "https://definicion.de/wp-content/uploads/2013/02/paseo-1.jpg",
            titulo: "Paseo al aire libre",
            descripcion: "Perfecto para caminar en parques o hacer senderismo con cielo despejado."
          },
          {
            img: 2,
            titulo: "Picnic o día de playa",
            descripcion: "Aprovecha el sol para un picnic o disfrutar de actividades acuáticas."
          },
          {
            img: 3,
            titulo: "Deportes exteriores",
            descripcion: "Ideal para ciclismo, tenis o cualquier deporte al aire libre."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Ropa ligera",
            descripcion: "Camisetas de algodón, shorts y vestidos frescos para el calor."
          },
          {
            img: 2,
            titulo: "Protección solar",
            descripcion: "Gafas de sol, sombrero y ropa con protección UV."
          },
          {
            img: 3,
            titulo: "Calzado cómodo",
            descripcion: "Sandalias o zapatos deportivos para mayor comodidad."
          }
        ]
      },
      nublado: {
        actividades: [
          {
            img: 1,
            titulo: "Visita a museos",
            descripcion: "Aprovecha para explorar galerías de arte o museos interiores."
          },
          {
            img: 2,
            titulo: "Café con amigos",
            descripcion: "Un día perfecto para reunirse en cafeterías acogedoras."
          },
          {
            img: 3,
            titulo: "Fotografía urbana",
            descripcion: "La luz suave es ideal para fotografía de paisajes urbanos."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Capas ligeras",
            descripcion: "Camiseta más una chaqueta ligera o suéter para cambios de temperatura."
          },
          {
            img: 2,
            titulo: "Pantalones cómodos",
            descripcion: "Jeans o pantalones de tela resistente y cómoda."
          },
          {
            img: 3,
            titulo: "Zapatos cerrados",
            descripcion: "Calzado que proteja de posibles lloviznas ligeras."
          }
        ]
      },
      lluvia_ligera: {
        actividades: [
          {
            img: 1,
            titulo: "Lectura en cafetería",
            descripcion: "Disfruta de un buen libro en un lugar cálido y seco."
          },
          {
            img: 2,
            titulo: "Cine en casa",
            descripcion: "Perfecto para maratones de películas o series favoritas."
          },
          {
            img: 3,
            titulo: "Cocina creativa",
            descripcion: "Aprovecha para probar nuevas recetas en casa."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Impermeable ligero",
            descripcion: "Chaqueta resistente al agua o paraguas para protección."
          },
          {
            img: 2,
            titulo: "Calzado impermeable",
            descripcion: "Botas o zapatos que mantengan tus pies secos."
          },
          {
            img: 3,
            titulo: "Capas cálidas",
            descripcion: "Ropa que mantenga el calor corporal en ambiente húmedo."
          }
        ]
      },
      lluvia_fuerte: {
        actividades: [
          {
            img: 1,
            titulo: "Actividades en interiores",
            descripcion: "Museos, centros comerciales o actividades bajo techo."
          },
          {
            img: 2,
            titulo: "Spa day en casa",
            descripcion: "Aprovecha para relajarte con un día de cuidado personal."
          },
          {
            img: 3,
            titulo: "Juegos de mesa",
            descripcion: "Perfecto para reuniones familiares o con amigos en casa."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Impermeable completo",
            descripcion: "Chaqueta y pantalón impermeables para máxima protección."
          },
          {
            img: 2,
            titulo: "Botas de lluvia",
            descripcion: "Calzado impermeable alto para evitar mojarse."
          },
          {
            img: 3,
            titulo: "Ropa de repuesto",
            descripcion: "Lleva ropa extra en caso de mojarse completamente."
          }
        ]
      },
      tormenta: {
        actividades: [
          {
            img: 1,
            titulo: "Quedarse en casa",
            descripcion: "La opción más segura durante tormentas eléctricas."
          },
          {
            img: 2,
            titulo: "Meditación interior",
            descripcion: "Aprovecha el sonido de la lluvia para relajarte."
          },
          {
            img: 3,
            titulo: "Organización personal",
            descripcion: "Ideal para ordenar espacios o planificar proyectos."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Ropa seca interior",
            descripcion: "Pijamas cómodas o ropa de estar por casa."
          },
          {
            img: 2,
            titulo: "Prendas cálidas",
            descripcion: "Suéteres y pantalones cómodos para interior."
          },
          {
            img: 3,
            titulo: "Calzado interior",
            descripcion: "Pantunflas o calcetines gruesos para comodidad."
          }
        ]
      },
      nieve: {
        actividades: [
          {
            img: 1,
            titulo: "Deportes de invierno",
            descripcion: "Esquí, snowboard o simplemente jugar con la nieve."
          },
          {
            img: 2,
            titulo: "Chocolate caliente",
            descripcion: "Disfruta de bebidas calientes en cafeterías acogedoras."
          },
          {
            img: 3,
            titulo: "Fotografía invernal",
            descripcion: "Captura paisajes nevados con la cámara."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Abrigo térmico",
            descripcion: "Chaqueta gruesa impermeable y aislante térmico."
          },
          {
            img: 2,
            titulo: "Accesorios de invierno",
            descripcion: "Guantes, gorro y bufanda para protección completa."
          },
          {
            img: 3,
            titulo: "Botas de nieve",
            descripcion: "Calzado antideslizante y resistente al agua."
          }
        ]
      },
      niebla: {
        actividades: [
          {
            img: 1,
            titulo: "Paseos misteriosos",
            descripcion: "Caminatas cortas disfrutando del ambiente misterioso."
          },
          {
            img: 2,
            titulo: "Fotografía atmosférica",
            descripcion: "Captura imágenes con efectos dramáticos y etéreos."
          },
          {
            img: 3,
            titulo: "Lectura en biblioteca",
            descripcion: "Ambiente perfecto para sumergirse en buenos libros."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Ropa visible",
            descripcion: "Prendas claras o reflectantes para mayor seguridad."
          },
          {
            img: 2,
            titulo: "Capas medias",
            descripcion: "Suéteres y chaquetas que mantengan el calor húmedo."
          },
          {
            img: 3,
            titulo: "Calzado resistente",
            descripcion: "Zapatos que proporcionen buena tracción en humedad."
          }
        ]
      },
      extremo: {
        actividades: [
          {
            img: 1,
            titulo: "Quedarse en interiores",
            descripcion: "Máxima seguridad durante condiciones climáticas extremas."
          },
          {
            img: 2,
            titulo: "Preparación de emergencia",
            descripcion: "Revisar suministros y plan de emergencia familiar."
          },
          {
            img: 3,
            titulo: "Actividades tranquilas",
            descripcion: "Ejercicios de relajación o hobbies indoor."
          }
        ],
        ropa: [
          {
            img: 1,
            titulo: "Ropa de protección",
            descripcion: "Prendas que cubran completamente brazos y piernas."
          },
          {
            img: 2,
            titulo: "Calzado robusto",
            descripcion: "Botas resistentes para condiciones difíciles."
          },
          {
            img: 3,
            titulo: "Accesorios de seguridad",
            descripcion: "Mascarilla o protección respiraria si es necesario."
          }
        ]
      }
    };

    return recomendaciones[tipoClima] || recomendaciones.despejado;
  }
})();