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

  // 2) Verificar si hay datos climáticos
  if (!desc) {
    mostrarMensajeSinDatos();
    return;
  }

  // 3) Determinar tipo de clima principal y generar recomendaciones
  const tipoClima = determinarTipoClima(desc);
  climaElement.textContent = desc;
  generarRecomendaciones(tipoClima);

  // ==================== FUNCIONES PRINCIPALES ====================

  function mostrarMensajeSinDatos() {
    actividadesContainer.innerHTML = `
      <div class="no-data">
        <h3>📡 No hay datos climáticos</h3>
        <p>Para ver recomendaciones personalizadas, primero busca una ciudad en la página de clima.</p>
        <a href="climainfo.html">Ir a buscar clima</a>
      </div>
    `;
    ropaContainer.innerHTML = `
      <div class="no-data">
        <p>Las recomendaciones de ropa aparecerán cuando consultes el clima de una ciudad.</p>
      </div>
    `;
  }

  function determinarTipoClima(descripcion) {
    const desc = descripcion.toLowerCase();
    
    // 1. Condiciones extremas
    if (desc.includes('tornado') || desc.includes('huracán') || desc.includes('ciclón') || 
        desc.includes('ceniza') || desc.includes('polvo') || desc.includes('granizo') || 
        desc.includes('inundación') || desc.includes('ola de calor') || desc.includes('ola de frío') ||
        desc.includes('helada') || desc.includes('torbellinos de arena') || desc.includes('arena')) return 'extremo';
    
    // 2. Tormentas eléctricas
    if (desc.includes('tormenta') || desc.includes('rayos') || desc.includes('truenos') || 
        desc.includes('eléctrica')) return 'tormenta';
    
    // 3. Viento
    if (desc.includes('viento') || desc.includes('ventoso') || desc.includes('ráfagas') || 
        desc.includes('vendaval') || desc.includes('temporal')) return 'viento';
    
    // 4. Nieve fuerte
    if (desc.includes('nevada') || desc.includes('ventisca') || 
        desc.includes('nevasca') || desc.includes('tormenta de nieve')) return 'nieve_fuerte';
    
    // 5. Nieve ligera
    if (desc.includes('aguanieve') || desc.includes('cellisca') || desc.includes('copos ligeros') || 
        desc.includes('nevada ligera') || desc.includes('nieve')) return 'nieve_ligera';
    
    // 6. Lluvia (TODOS los tipos de lluvia)
    if (desc.includes('llovizna') || desc.includes('garúa') || desc.includes('lluvia ligera') || 
        desc.includes('lluvia leve') || desc.includes('lluvia moderada') || desc.includes('lluvia intensa') || 
        desc.includes('aguacero') || desc.includes('diluvió') || desc.includes('chubascos') || desc.includes('lluvia')) return 'lluvia';
    
    // 7. Niebla
    if (desc.includes('niebla') || desc.includes('neblina') || desc.includes('calima') || 
        desc.includes('visibilidad reducida') || desc.includes('humo') || desc.includes('escarcha') ||
        desc.includes('bruma') || desc.includes('mist') || desc.includes('humedad') || desc.includes('rocío')) return 'niebla';
    
    // 8. Parcialmente nublado
    if (desc.includes('pocas nubes') || desc.includes('nubes dispersas') || 
        desc.includes('parcialmente nublado') || desc.includes('intervalos nubosos') ||
        desc.includes('algo de nubes') || desc.includes('algunas nubes') || desc.includes('nubes y claros')) return 'parcialmente_nublado';
    
    // 9. Nublado
    if (desc.includes('muy nubloso') || desc.includes('totalmente nublado') || 
        desc.includes('cubierto') || desc.includes('nublado') || desc.includes('nubes rotas') || desc.includes('nubes')) return 'nublado';
    
    // 10. Despejado (por defecto)
    if (desc.includes('cielo claro') || desc.includes('despejado') || 
        desc.includes('soleado') || desc.includes('sin nubes')) return 'despejado';
    
    return 'despejado'; // Por defecto si no coincide con nada
}

  function generarRecomendaciones(tipoClima) {
    const recomendaciones = obtenerRecomendacionesPorClima(tipoClima);
    
    // Generar actividades
    actividadesContainer.innerHTML = recomendaciones.actividades.map(act => `
      <div class="card">
        <img src="src/img/actividad/${act.img}.png" alt="${act.titulo}">
        <h3>${act.titulo}</h3>
        <p>${act.descripcion}</p>
      </div>
    `).join('');

    // Generar ropa (VERSIÓN MEJORADA para múltiples imágenes)
    ropaContainer.innerHTML = recomendaciones.ropa.map(outfit => {
        // Si img es un array, mostrar múltiples imágenes
        if (Array.isArray(outfit.img)) {
            return `
            <div class="card">
                <div class="multiple-images">
                    ${outfit.img.map(img => `
                        <img src="src/img/ropa/${img}.png" alt="${outfit.titulo}">
                    `).join('')}
                </div>
                <h3>${outfit.titulo}</h3>
                <p>${outfit.descripcion}</p>
            </div>
            `;
        } 
        // Si img es string, mostrar una sola imagen (compatibilidad hacia atrás)
        else {
            return `
            <div class="card">
                <img src="src/img/ropa/${outfit.img}.png" alt="${outfit.titulo}">
                <h3>${outfit.titulo}</h3>
                <p>${outfit.descripcion}</p>
            </div>
            `;
        }
    }).join('');
} // funcion modificada para multiples imagenes

  function obtenerRecomendacionesPorClima(tipoClima) {
    const recomendaciones = {
        despejado: {
            actividades: [
                {
                    img: "walking",
                    titulo: "Senderismo en parques naturales",
                    descripcion: "Ruta de 5-10km por áreas verdes con calzado deportivo"
                },
                {
                    img: "picnic",
                    titulo: "Picnic al aire libre",
                    descripcion: "Almuerzo en parques o áreas recreativas con manta y juegos"
                },
                {
                    img: "sport",
                    titulo: "Deportes al aire libre",
                    descripcion: "Partidos de fútbol, tenis o pádel"
                }
            ],
            ropa: [
                {
                    img: ["shirt", "sandals"],
                    titulo: "Vestimenta ligera + sandalias",
                    descripcion: "Ropa fresca de algodón con calzado abierto"
                },
                {
                    img: ["shorts", "football"],
                    titulo: "Shorts + camiseta deportiva",
                    descripcion: "Conjunto para ejercicio con gorra"
                },
                {
                    img: ["poodle-skirt", "blouse", "jogging"],
                    titulo: "Falda + blusa + zapatos cómodos",
                    descripcion: "Outfit fresco para paseos urbanos"
                }
            ]
        },
        parcialmente_nublado: {
            actividades: [
                {
                    img: "bicycle",
                    titulo: "Paseo en bicicleta",
                    descripcion: "Recorrido por ciclovías y parques de la ciudad"
                },
                {
                    img: "terrace",
                    titulo: "Tarde en terrazas",
                    descripcion: "Disfrutar de bebidas y comida con vistas panorámicas"
                },
                {
                    img: "world-book-day",
                    titulo: "Visita a ferias culturales",
                    descripcion: "Exploración de eventos culturales y exposiciones"
                }
            ],
            ropa: [
                {
                    img: ["jeans", "tee-shirt", "hoodie"],
                    titulo: "Jeans + camiseta + suéter ligero",
                    descripcion: "Ideal para adaptarse a cambios de temperatura"
                },
                {
                    img: ["trouser", "polo-shirt2", "denim-jacket"],
                    titulo: "Pantalón casual + polo + chamarra ligera",
                    descripcion: "Vestimenta casual y práctica"
                },
                {
                    img: ["skirt", "person", "shoes-w"],
                    titulo: "Vestido + chamarra ligera + zapatos cómodos",
                    descripcion: "Estilo adaptable con calzado cómodo"
                }
            ]
        },
        nublado: {
            actividades: [
                {
                    img: "shopping-cart",
                    titulo: "Ir de compras al centro comercial",
                    descripcion: "Recorrer tiendas y áreas de comida"
                },
                {
                    img: "book",
                    titulo: "Recorrer bibliotecas o librerías",
                    descripcion: "Descubrir y leer libros nuevos"
                },
                {
                    img: "cinema",
                    titulo: "Función de cine o teatro",
                    descripcion: "Disfrutar de proyecciones o actuaciones artísticas"
                }
            ],
            ropa: [
                {
                    img: ["woman", "jeans-w", "covering"],
                    titulo: "Chaqueta impermeable + jeans + paraguas",
                    descripcion: "Protección completa para lloviznas"
                },
                {
                    img: ["trousers", "jacket-water3", "rubber"],
                    titulo: "Suéter + pantalón resistente al agua + botas",
                    descripcion: "Protección contra humedad"
                },
                {
                    img: ["jacket-w", "jogger-pants", "sneakers"],
                    titulo: "Sudadera con capucha + leggings + tenis impermeables",
                    descripcion: "Confort y protección ligera"
                }
            ]
        },
        lluvia: {
            actividades: [
                {
                    img: "read",
                    titulo: "Maratón de lectura",
                    descripcion: "Disfrutar de varias horas leyendo tu libro favorito"
                },
                {
                    img: "popcorn",
                    titulo: "Cine en casa",
                    descripcion: "Ver una saga de películas con snacks y ambiente cómodo"
                },
                {
                    img: "cooking",
                    titulo: "Clases de cocina",
                    descripcion: "Aprender a preparar nuevas recetas paso a paso"
                }
            ],
            ropa: [
                {
                    img: ["woman", "rubber"],
                    titulo: "Impermeable + botas de lluvia",
                    descripcion: "Seco y protegido contra la lluvia"
                },
                {
                    img: ["jacket-water", "jeans","backpack"],
                    titulo: "Chaqueta resistente al agua + pantalón cómodo + mochila impermeable",
                    descripcion: "Equipado para salir"
                },
                {
                    img: ["hood", "leggings2", "hiking-boots"],
                    titulo: "Chamarra con capucha + leggings + botas impermeables",
                    descripcion: "Cómodo y listo para la lluvia"
                }
            ]
        },
        tormenta: {
            actividades: [
                {
                    img: "movie-house",
                    titulo: "Home cinema",
                    descripcion: "Sesión de películas con sistema de sonido"
                },
                {
                    img: "yoga",
                    titulo: "Yoga y meditación",
                    descripcion: "Practicar ejercicios de relajación y respiración"
                },
                {
                    img: "house",
                    titulo: "Organización del hogar",
                    descripcion: "Reorganización de armarios y espacios de la casa"
                }
            ],
            ropa: [
                {
                    img: ["pijama", "espadrille"],
                    titulo: "Pijama de algodón + pantuflas",
                    descripcion: "Máxima comodidad para estar en casa"
                },
                {
                    img: "football-uniform",
                    titulo: "Ropa deportiva para casa",
                    descripcion: "Conjunto cómodo para estar en casa"
                },
                {
                    img: ["jogger-pants", "t-shirt", "socks"],
                    titulo: "Leggings + playera holgada + calcetines cálidos",
                    descripcion: "Conjunto de prendas cálidas y cómodas"
                }
            ]
        },
        nieve_ligera: {
            actividades: [
                {
                    img: "snowball",
                    titulo: "Paseos por paisajes nevados",
                    descripcion: "Caminatas cortas para disfrutar del invierno"
                },
                {
                    img: "hot-chocolate",
                    titulo: "Chocolate caliente en cafés",
                    descripcion: "Degustar bebidas calientes en sitios confortables"
                },
                {
                    img: "tree",
                    titulo: "Fotografía invernal",
                    descripcion: "Captura de paisajes y retratos con nieve"
                }
            ],
            ropa: [
                {
                    img: ["clothes-winter", "boots-winter","winter-gloves"],
                    titulo: "Abrigo de lana + jeans + botas resistentes + guantes",
                    descripcion: "Abrigado y protegido del frío"
                },
                {
                    img: ["jacket-winter", "pants-winter2","scarf-winters"],
                    titulo: "Chaqueta acolchada + pantalón de invierno + gorro + bufanda",
                    descripcion: "Cálido y listo para la nieve"
                },
                {
                    img: ["jacket-woman", "leggings2","boot-shoes-winter"],
                    titulo: "Chamarra gruesa + leggings térmicos + calzado antideslizante",
                    descripcion: "Equipado para caminar sobre nieve"
                }
            ]
        },
        nieve_fuerte: {
            actividades: [
                {
                    img: "slope",
                    titulo: "Deportes de invierno",
                    descripcion: "Esquí, snowboard o trineo en pistas nevadas"
                },
                {
                    img: "snowball2",
                    titulo: "Juegos en la nieve",
                    descripcion: "Construcción de muñecos y batallas de nieve"
                },
                {
                    img: "cabin-winter",
                    titulo: "Estancias en cabañas",
                    descripcion: "Compartir tiempo en espacios protegidos de la nieve"
                }
            ],
            ropa: [
                {
                    img: ["winter-clothes", "winter-gloves3", "goggles-winter"],
                    titulo: "Traje de nieve completo + guantes + gafas",
                    descripcion: "Equipamiento completo para deportes de invierno"
                },
                {
                    img: ["jacket-grueso", "sweater-winter3", "winter-boot2"],
                    titulo: "Abrigo grueso + varias capas térmicas + botas de nieve",
                    descripcion: "Máxima protección contra el frío"
                },
                {
                    img: ["jacket-winter", "pants-winter", "scarf-winters"],
                    titulo: "Chamarra extrema + pantalón térmico + protección facial",
                    descripcion: "Abrigado para condiciones extremas"
                }
            ]
        },
        niebla: {
            actividades: [
                {
                    img: "map-compass",
                    titulo: "Caminatas cortas con brújula",
                    descripcion: "Rutas breves en áreas conocidas"
                },
                {
                    img: "landscape-niebla2",
                    titulo: "Fotografía atmosférica",
                    descripcion: "Capturar paisajes y efectos visuales con niebla"
                },
                {
                    img: "library",
                    titulo: "Bibliotecas",
                    descripcion: "Lectura y estudio en espacios interiores bien iluminados"
                }
            ],
            ropa: [
                {
                    img: ["brand", "reflective-vest2"],
                    titulo: "Ropa de colores claros + elementos reflectantes",
                    descripcion: "Mayor visibilidad para seguridad"
                },
                {
                    img: ["coat-niebla", "trousers-niebla", "flashlight"],
                    titulo: "Abrigo claro + pantalones visibles + linterna",
                    descripcion: "Prendas claras con iluminación"
                },
                {
                    img: ["jacket-color", "wristwatch", "shoes-w"],
                    titulo: "Chamarra colorida + accesorios reflectantes + calzado antideslizante",
                    descripcion: "Visible y seguro para caminar"
                }
            ]
        },
        viento: {
            actividades: [
                {
                    img: "windsurfing",
                    titulo: "Deportes de viento",
                    descripcion: "Volar cometas, hacer windsurf o kitesurf"
                },
                {
                    img: "hiking-travel2",
                    titulo: "Rutas protegidas",
                    descripcion: "Caminar por zonas resguardadas del viento fuerte"
                },
                {
                    img: "diy-hammer",
                    titulo: "Talleres en interiores",
                    descripcion: "Actividades manuales y creativas bajo techo"
                }
            ],
            ropa: [
                {
                    img: ["inuit", "wind", "pants-winter"],
                    titulo: "Ropa cortaviento",
                    descripcion: "Prendas que reducen la resistencia al viento"
                },
                {
                    img: ["jacket-thermal", "thermal-underwear", "safety-glasses"],
                    titulo: "Chaqueta cortaviento + ropa térmica + gafas",
                    descripcion: "Protegido del viento y el polvo"
                },
                {
                    img: ["jacket-4", "tights2", "sneakers3"],
                    titulo: "Chamarra resistente + mallas + calzado estable",
                    descripcion: "Seguro en condiciones ventosas"
                }
            ]
        },
        extremo: {
            actividades: [
                {
                    img: "31",
                    titulo: "Permanecer en interiores seguros",
                    descripcion: "Resguardarse en zonas protegidas del hogar"
                },
                {
                    img: "32",
                    titulo: "Revisar kit de emergencia",
                    descripcion: "Verificar suministros básicos y documentos importantes"
                },
                {
                    img: "33",
                    titulo: "Actividades tranquilas en casa",
                    descripcion: "Hobbies particulares"
                }
            ],
            ropa: [
                {
                    img: "31",
                    titulo: "Ropa de protección completa",
                    descripcion: "Prendas que cubran todo el cuerpo"
                },
                {
                    img: "32",
                    titulo: "Calzado resistente + guantes",
                    descripcion: "Protección para manos y pies"
                },
                {
                    img: "33",
                    titulo: "Mascarilla + gafas protectoras",
                    descripcion: "Para resguardar vías respiratorias y ojos"
                }
            ]
        }
    };

    return recomendaciones[tipoClima] || recomendaciones.despejado;
}
})();