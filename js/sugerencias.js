(function () {
  const el = document.getElementById('tipo-clima');

  // 1) intenta leer ?desc= de la URL
  const params = new URLSearchParams(location.search);
  let desc = params.get('desc');

  // 2) si no viene, lee respaldo de sessionStorage (guardado desde climainfo)
  if (!desc) {
    try {
      const raw = sessionStorage.getItem('climon.rec');
      if (raw) desc = (JSON.parse(raw).desc || '').trim();
    } catch {}
  }

  // 3) valor por defecto si no hay nada
  el.textContent = desc && desc.length ? desc : 'clima de tu ciudad';
})();
