// ============================================================
// CONFIGURACIÓN DE VERSIÓN - Control de qué página mostrar
// ============================================================
(function() {
  'use strict';

  // ============================================================
  // CONFIGURACIÓN - CAMBIA ESTO PARA ACTIVAR/DESACTIVAR
  // ============================================================
  const CONFIG = {
    // 🔥 CAMBIA ESTO A 'true' para mostrar la versión MENÚ
    // 🔥 CAMBIA ESTO A 'false' para mostrar la versión NORMAL
    mostrarVersionMenu: false,  // 👈 CAMBIA AQUÍ

    // Nombre de la carpeta donde está la versión menú
    carpetaMenu: 'menu',
    
    // Archivo principal de la versión menú
    archivoMenu: 'index.html',
    
    // Versión actual (para debugging)
    version: '1.0.0'
  };

  // ============================================================
  // FUNCIÓN PARA REDIRIGIR SEGÚN LA CONFIGURACIÓN
  // ============================================================
  function redirigirSegunVersion() {
    // Obtener la URL actual
    const urlActual = window.location.pathname;
    const nombreArchivo = urlActual.split('/').pop() || 'index.html';
    
    console.log('🔵 [Config] Versión actual:', CONFIG.version);
    console.log('🔵 [Config] Mostrar menú:', CONFIG.mostrarVersionMenu);
    console.log('🔵 [Config] Archivo actual:', nombreArchivo);

    // Si estamos en la versión menú, no hacer nada si ya estamos ahí
    if (urlActual.includes(CONFIG.carpetaMenu)) {
      console.log('🔵 Ya estamos en la versión menú');
      return;
    }

    // Si la configuración dice que mostremos menú y NO estamos en menú
    if (CONFIG.mostrarVersionMenu && !urlActual.includes(CONFIG.carpetaMenu)) {
      console.log('🔄 Redirigiendo a versión MENÚ...');
      // Redirigir a la carpeta menu
      const nuevaUrl = window.location.origin + '/' + 
                      CONFIG.carpetaMenu + '/' + 
                      CONFIG.archivoMenu +
                      window.location.search;
      window.location.href = nuevaUrl;
      return;
    }

    // Si la configuración dice que NO mostremos menú y estamos en menú
    if (!CONFIG.mostrarVersionMenu && urlActual.includes(CONFIG.carpetaMenu)) {
      console.log('🔄 Redirigiendo a versión NORMAL...');
      // Redirigir a la raíz
      const nuevaUrl = window.location.origin + '/' + CONFIG.archivoMenu;
      window.location.href = nuevaUrl;
      return;
    }

    console.log('✅ Versión correcta, no se necesita redirigir');
  }

  // ============================================================
  // EJECUTAR LA REDIRECCIÓN
  // ============================================================
  // Esperar a que la página esté lista
  if (document.readyState === 'complete') {
    redirigirSegunVersion();
  } else {
    window.addEventListener('load', redirigirSegunVersion);
  }

  // ============================================================
  // EXPONER FUNCIONES PARA USAR DESDE CONSOLA (DEBUG)
  // ============================================================
  window.configVersion = {
    // Función para activar menú desde consola
    activarMenu: function() {
      CONFIG.mostrarVersionMenu = true;
      console.log('🔄 Activando versión MENÚ...');
      redirigirSegunVersion();
    },
    
    // Función para desactivar menú desde consola
    desactivarMenu: function() {
      CONFIG.mostrarVersionMenu = false;
      console.log('🔄 Activando versión NORMAL...');
      redirigirSegunVersion();
    },
    
    // Función para ver estado actual
    estado: function() {
      console.log('📊 Estado actual:');
      console.log('  - Mostrar menú:', CONFIG.mostrarVersionMenu);
      console.log('  - Versión:', CONFIG.version);
      console.log('  - Carpeta menú:', CONFIG.carpetaMenu);
      console.log('  - URL actual:', window.location.href);
    }
  };

  console.log('✅ [Config] Script cargado correctamente');
  console.log('💡 Para cambiar desde consola:');
  console.log('  - configVersion.activarMenu()  → Mostrar menú');
  console.log('  - configVersion.desactivarMenu() → Mostrar normal');
  console.log('  - configVersion.estado() → Ver estado actual');

})();
