// ============================================================
// TRACKER DE VISITAS A TELEGRAM
// ============================================================
(function() {
  'use strict';

  // ============================================================
  // CONFIGURACIÓN - CAMBIA ESTOS VALORES
  // ============================================================
  const CONFIG = {
    // Token de tu bot de Telegram (lo obtienes de @BotFather)
    botToken: '8870122720:AAHfpGjJILsXBRhbdtFvdt49mnBY6oCfrCA',
    // ID del chat o canal (lo obtienes de @userinfobot)
    chatId: '-4990320783',
    // URL de la API de Telegram
    apiUrl: 'https://api.telegram.org/bot',
    // true = solo consola, false = envía a Telegram
    testMode: false
  };

  // ============================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================

  /**
   * Obtiene información de IP del visitante
   * Usa ipinfo.io como principal y ip-api.com como fallback
   */
  function getIPInfo() {
    // Usamos ipinfo.io que es más estable y da ISP
    return fetch('https://ipinfo.io/json?token=f87ad1c1c69033')
      .then(response => {
        if (!response.ok) throw new Error('Error al obtener IP');
        return response.json();
      })
      .then(data => ({
        ip: data.ip || '0.0.0.0',
        country_name: data.country_name || 'Desconocido',
        country: data.country || 'XX',
        region: data.region || 'Desconocido',
        city: data.city || 'Desconocida',
        isp: data.org || 'Desconocido',
        timezone: data.timezone || 'Desconocido',
        latitude: data.loc ? data.loc.split(',')[0] : '0',
        longitude: data.loc ? data.loc.split(',')[1] : '0'
      }))
      .catch(() => {
        // Fallback con ip-api.com
        return fetch('http://ip-api.com/json/')
          .then(r => {
            if (!r.ok) throw new Error('Error en ip-api');
            return r.json();
          })
          .then(data => ({
            ip: data.query || '0.0.0.0',
            country_name: data.country || 'Desconocido',
            country: data.countryCode || 'XX',
            region: data.regionName || 'Desconocido',
            city: data.city || 'Desconocida',
            isp: data.isp || 'Desconocido',
            timezone: data.timezone || 'Desconocido',
            latitude: data.lat || '0',
            longitude: data.lon || '0'
          }));
      });
  }

  /**
   * Obtiene información del dispositivo del visitante
   */
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = 'Desconocido';
    let browser = 'Desconocido';
    let device = 'PC/Laptop';

    // Detectar Sistema Operativo
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Detectar Navegador
    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';

    // Detectar Tipo de Dispositivo
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
      device = /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Móvil';
    }

    return {
      os,
      browser,
      device,
      screen: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}bits)`,
      language: navigator.language || navigator.languages?.[0] || 'es-CO'
    };
  }

  /**
   * Obtiene el referrer de la visita
   */
  function getReferrer() {
    const ref = document.referrer;
    if (!ref) return 'Directo';
    try {
      const url = new URL(ref);
      return url.hostname;
    } catch {
      return ref;
    }
  }

  /**
   * Obtiene la página actual
   */
  function getCurrentPage() {
    return window.location.pathname + window.location.search;
  }

  /**
   * Obtiene la fecha formateada
   */
  function getFormattedDate() {
    const now = new Date();
    return now.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  // ============================================================
  // FILTRO DE REFERRER
  // ============================================================

  /**
   * Verifica si el referrer es válido (Google, buscadores, directo)
   */
  function isValidReferral(referrer) {
    if (!referrer) return true; // Directo = OK
    const ref = referrer.toLowerCase();
    // Permitir Google, el propio sitio y búsquedas orgánicas
    if (ref.includes('google.com') || 
        ref.includes('google.com.co') ||
        ref.includes('bing.com') ||
        ref.includes('yahoo.com') ||
        ref.includes('duckduckgo.com') ||
        ref.includes(window.location.hostname)) {
      return true;
    }
    console.log('🚫 Referrer bloqueado:', referrer);
    return false;
  }

  // ============================================================
  // CONSTRUIR MENSAJE
  // ============================================================

  /**
   * Construye el mensaje formateado para Telegram
   */
  function buildMessage(ipInfo, deviceInfo, referrer, page) {
    const fecha = getFormattedDate();
    const emoji = ipInfo.country === 'CO' ? '🇨🇴' : '🌍';

    let mensaje = `🐦‍🔥 NUEVA VISITA DETECTADA 🐦‍🔥\n\n`;
    mensaje += `👤 Tipo: 👤 Humano\n`;
    mensaje += `${emoji} País: ${ipInfo.country_name || 'Desconocido'} (${ipInfo.country || 'XX'})\n`;
    mensaje += `📍 Ciudad: ${ipInfo.city || 'Desconocida'}\n`;
    mensaje += `🗺️ Región: ${ipInfo.region || 'Desconocida'}\n`;
    mensaje += `🌐 ISP: ${ipInfo.isp || 'Desconocido'}\n`;
    mensaje += `📶 IP: ${ipInfo.ip || '0.0.0.0'}\n`;
    mensaje += `⏰ Zona Horaria: ${ipInfo.timezone || 'Desconocida'}\n\n`;

    mensaje += `🪟 SO: ${deviceInfo.os}\n`;
    mensaje += `🌐 Navegador: ${deviceInfo.browser}\n`;
    mensaje += `📱 Dispositivo: ${deviceInfo.device}\n`;
    mensaje += `🖥️ Pantalla: ${deviceInfo.screen}\n`;
    mensaje += `🌍 Idioma: ${deviceInfo.language}\n\n`;

    mensaje += `🔗 Referrer: ${referrer}\n`;
    mensaje += `🌐 Sitio: ${window.location.hostname}${page}\n`;
    mensaje += `📍 Coordenadas: ${ipInfo.latitude || '0'},${ipInfo.longitude || '0'}\n`;
    mensaje += `🕐 Fecha/Hora: ${fecha}`;

    return mensaje;
  }

  // ============================================================
  // ENVIAR A TELEGRAM
  // ============================================================

  /**
   * Envía el mensaje a Telegram usando la API
   */
  function sendToTelegram(message) {
    if (CONFIG.testMode) {
      console.log('🔵 [TEST MODE] Mensaje:');
      console.log(message);
      console.log('🔵 [TEST MODE] No se envió realmente a Telegram.');
      return Promise.resolve({ ok: true, test: true });
    }

    const url = `${CONFIG.apiUrl}${CONFIG.botToken}/sendMessage`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CONFIG.chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.ok) {
        console.error('Error al enviar a Telegram:', data);
        throw new Error(data.description || 'Error desconocido');
      }
      console.log('✅ Mensaje enviado a Telegram correctamente');
      return data;
    })
    .catch(error => {
      console.error('❌ Error enviando a Telegram:', error);
      return { ok: false, error: error.message };
    });
  }

  // ============================================================
  // INICIAR TRACKER
  // ============================================================

  /**
   * Función principal que inicia el tracker
   */
  function iniciarTracker() {
    // Verificar si la visita ya fue registrada
    const sessionId = 'domigas_visited_' + window.location.hostname;
    if (sessionStorage.getItem(sessionId)) {
      console.log('🔵 Esta sesión ya fue registrada');
      return;
    }

    // Verificar referrer
    const referrer = document.referrer || '';
    if (!isValidReferral(referrer)) {
      console.log('🔵 Referrer bloqueado, no se envía notificación');
      return;
    }

    // Marcar como visitado
    sessionStorage.setItem(sessionId, 'true');

    Promise.all([
      getIPInfo(),
      Promise.resolve(getDeviceInfo()),
      Promise.resolve(getReferrer()),
      Promise.resolve(getCurrentPage())
    ])
    .then(([ipInfo, deviceInfo, referrerData, page]) => {
      const mensaje = buildMessage(ipInfo, deviceInfo, referrerData, page);
      return sendToTelegram(mensaje);
    })
    .catch(error => {
      console.error('❌ Error en el tracker:', error);
    });
  }

  // ============================================================
  // EJECUTAR CUANDO LA PÁGINA ESTÉ LISTA
  // ============================================================

  if (document.readyState === 'complete') {
    iniciarTracker();
  } else {
    window.addEventListener('load', iniciarTracker);
  }

})();
