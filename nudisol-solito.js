// ============================================================
// SOLITO — Asistente de Nudisol
// ============================================================

(function() {

  const SYSTEM_PROMPT = `Eres Solito, el asistente oficial de Nudisol (nudisol.app), la primera app naturista española. Tienes personalidad cercana, cálida y con sentido del humor. Siempre terminas con un emoji de sol 🌞. Detecta el idioma del usuario y responde SIEMPRE en el mismo idioma que él use. Si escribe en inglés, responde en inglés. Si escribe en español, responde en español.

SOBRE NUDISOL:
- App naturista española con +1.000 lugares verificados en España (playas, calas, campings, urbanizaciones)
- Gratuita, sin publicidad, sin necesidad de App Store ni Google Play (es una PWA)
- Instalación: en Android abre nudisol.app en Chrome y aparece banner automático. En iPhone abre en Safari → compartir → "Añadir a pantalla de inicio"
- Email de contacto: info@nudisol.com

ACCESO A LA APP:
- Modo invitado: puede ver lugares y secciones pero no puede escribir ni hacer check-in
- Usuario registrado: acceso completo con email y contraseña. Tipos: nudista, naturista, host (alojamientos)

SECCIONES:
1. LUGARES: +1.000 playas y espacios naturistas organizados por provincia en desplegable. También por ubicación cercana activando GPS. Cada ficha muestra temperatura del agua, olas, radiación UV, temperatura exterior y puntuación 0-10.
2. CHECK-IN: El usuario indica que está en una playa, marca ambiente (NUDISTA/MIXTA/TEXTIL) y aforo (poco/medio/mucho). Dura 8 horas o se cierra manualmente. Visible para toda la comunidad en tiempo real.
3. COMUNIDAD: 5 foros — Presentaciones, Viajes, Vida Naturista, Buzón de Sugerencias y Noticias. Solo usuarios registrados pueden crear temas y responder.
4. ALOJAMIENTOS: Sección activa con alojamientos naturistas verificados en España. Apartamentos, campings, casas rurales y más, todos en entornos naturistas o naturista-friendly. Contacto directo con el propietario, sin comisiones. Si alguien tiene un alojamiento naturista y quiere publicarlo gratis, puede escribir a info@nudisol.com
5. ÍNDICE UV: Radiación solar en tiempo real. Indica tiempo de exposición para producir vitamina D y alertas de protección.
6. PERFIL: Foto, nombre, tipo de usuario, historial de check-ins, playas visitadas, cerrar sesión.
7. NEWSLETTER: Suscripción con email. Contenido de valor sobre naturismo, playas y comunidad.

PERSONALIDAD DE SOLITO:
- Cercano, cálido, con humor inocente
- Puede contar chistes naturistas cortos e inocentes si se los piden
- Nunca robótico ni corporativo
- Siempre útil, nunca inventa datos

REGLAS ABSOLUTAS — NUNCA responde sobre:
- Contactos sexuales, ligue, intercambios de parejas, clubes liberales
- Lugares de encuentro gay o sexual
- Sustancias ilegales o drogas
- Datos personales del equipo de Nudisol
- Recomendaciones médicas o legales concretas
- Herramientas tecnológicas que usa Nudisol internamente
- Playas o lugares que NO estén en Nudisol
- Política, partidos o dirigentes políticos
- Ordenanzas municipales específicas (deriva a ayuntamiento o FEN)

ANTE PREGUNTAS FUERA DE ÁMBITO:
Responde con gracia, sin ser borde, y redirige a lo que sí puedes hacer.

ANTE PREGUNTAS LEGALES O MÉDICAS:
Da información general y deriva a profesionales o a la Federación Española de Naturismo (naturismo.org).

FILOSOFÍA:
El naturismo es respeto al cuerpo, conexión con la naturaleza e igualdad. No tiene relación con el sexo ni el liberalismo. Nudisol es la llave que abre ese mundo.`;

  let historial = [];

  function crearUI() {
    const style = document.createElement('style');
    style.textContent = `
      #solito-btn {
        position: fixed; bottom: 90px; right: 16px;
        width: 62px; height: 62px; border-radius: 50%;
        background: linear-gradient(135deg, #F2C849, #E8A020);
        border: none; cursor: pointer; z-index: 9999;
        box-shadow: 0 4px 20px rgba(242,200,73,0.5);
        font-size: 30px; display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #solito-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(242,200,73,0.7); }
      #solito-ventana {
        position: fixed; bottom: 160px; right: 16px;
        width: 340px; max-width: calc(100vw - 32px);
        height: 480px; max-height: calc(100vh - 120px);
        background: #0e2426; border-radius: 20px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.5); z-index: 9998;
        display: none; flex-direction: column; overflow: hidden;
        border: 1px solid rgba(242,200,73,0.2); font-family: 'DM Sans', sans-serif;
      }
      #solito-ventana.abierto { display: flex; }
      #solito-header {
        background: linear-gradient(135deg, #1F4D52, #0e2426);
        padding: 14px 16px; display: flex; align-items: center; gap: 10px;
        border-bottom: 1px solid rgba(242,200,73,0.15);
      }
      #solito-avatar {
        width: 38px; height: 38px; border-radius: 50%;
        background: linear-gradient(135deg, #F2C849, #E8A020);
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; flex-shrink: 0;
      }
      #solito-header-info { flex: 1; }
      #solito-nombre { font-size: 14px; font-weight: 700; color: #F8F1E4; font-family: 'Syne', sans-serif; }
      #solito-estado { font-size: 11px; color: rgba(242,200,73,0.7); }
      #solito-cerrar { background: none; border: none; color: rgba(248,241,228,0.5); font-size: 20px; cursor: pointer; padding: 4px; }
      #solito-mensajes {
        flex: 1; overflow-y: auto; padding: 14px;
        display: flex; flex-direction: column; gap: 10px;
      }
      #solito-mensajes::-webkit-scrollbar { width: 4px; }
      #solito-mensajes::-webkit-scrollbar-thumb { background: rgba(242,200,73,0.3); border-radius: 2px; }
      .solito-msg {
        max-width: 85%; padding: 10px 13px; border-radius: 14px;
        font-size: 13px; line-height: 1.5; word-break: break-word;
      }
      .solito-msg.bot { background: #1F4D52; color: #F8F1E4; align-self: flex-start; border-bottom-left-radius: 4px; }
      .solito-msg.user { background: #F2C849; color: #0e2426; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
      .solito-msg.typing { background: #1F4D52; color: rgba(248,241,228,0.5); align-self: flex-start; font-style: italic; font-size: 12px; }
      #solito-input-area {
        padding: 12px; border-top: 1px solid rgba(242,200,73,0.15);
        display: flex; gap: 8px; background: #0a1e20;
      }
      #solito-input {
        flex: 1; background: #1F4D52; border: 1px solid rgba(242,200,73,0.2);
        border-radius: 12px; padding: 10px 13px; color: #F8F1E4;
        font-size: 13px; font-family: 'DM Sans', sans-serif;
        outline: none; resize: none; height: 40px; max-height: 80px;
      }
      #solito-input::placeholder { color: rgba(248,241,228,0.35); }
      #solito-input:focus { border-color: rgba(242,200,73,0.5); }
      #solito-enviar {
        width: 40px; height: 40px; border-radius: 50%;
        background: linear-gradient(135deg, #F2C849, #E8A020);
        border: none; cursor: pointer; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: transform 0.15s;
      }
      #solito-enviar:hover { transform: scale(1.1); }
      #solito-enviar:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      #solito-mic {
        width: 40px; height: 40px; border-radius: 50%;
        background: #1F4D52; border: 1px solid rgba(242,200,73,0.3);
        cursor: pointer; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: all 0.15s;
      }
      #solito-mic:hover { background: #2a6570; }
      #solito-mic.escuchando { background: #CC2200; border-color: #CC2200; animation: pulso 1s infinite; }
      @keyframes pulso { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'solito-btn';
    btn.innerHTML = '🌞';
    btn.title = 'Habla con Solito';
    btn.onclick = toggleSolito;
    document.body.appendChild(btn);

    const ventana = document.createElement('div');
    ventana.id = 'solito-ventana';
    ventana.innerHTML = `
      <div id="solito-header">
        <div id="solito-avatar">🌞</div>
        <div id="solito-header-info">
          <div id="solito-nombre">Solito</div>
          <div id="solito-estado">Asistente de Nudisol</div>
        </div>
        <button id="solito-cerrar" onclick="document.getElementById('solito-ventana').classList.remove('abierto')">✕</button>
      </div>
      <div id="solito-mensajes"></div>
      <div id="solito-input-area">
        <textarea id="solito-input" placeholder="Preguntame lo que quieras..." rows="1"></textarea>
        <button id="solito-mic" onclick="window.solitoMic()" title="Hablar">🎤</button>
        <button id="solito-enviar" onclick="window.solitoEnviar()">➤</button>
      </div>
    `;
    document.body.appendChild(ventana);

    document.getElementById('solito-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.solitoEnviar(); }
    });

    agregarMensaje('bot', 'Hola! Soy Solito, tu asistente en Nudisol. 🌞 En que puedo ayudarte hoy?');
  }

  function toggleSolito() {
    const ventana = document.getElementById('solito-ventana');
    ventana.classList.toggle('abierto');
    if (ventana.classList.contains('abierto')) {
      setTimeout(() => document.getElementById('solito-input').focus(), 100);
    }
  }

  function agregarMensaje(tipo, texto) {
    const cont = document.getElementById('solito-mensajes');
    const div = document.createElement('div');
    div.className = 'solito-msg ' + tipo;
    div.textContent = texto;
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;
    return div;
  }

  window.solitoEnviar = async function() {
    const input = document.getElementById('solito-input');
    const btn = document.getElementById('solito-enviar');
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';
    btn.disabled = true;
    agregarMensaje('user', texto);
    historial.push({ role: 'user', content: texto });
    analizarYGuardar(texto);
    const typing = agregarMensaje('typing', 'Solito esta pensando...');
    try {
      const respuesta = await llamarAPI(historial);
      typing.remove();
      agregarMensaje('bot', respuesta);
      historial.push({ role: 'assistant', content: respuesta });
      if (historial.length > 20) historial = historial.slice(-20);
    } catch (e) {
      typing.remove();
      agregarMensaje('bot', 'Lo siento, ha habido un error. Intentalo de nuevo en un momento. 🌞');
    }
    btn.disabled = false;
    input.focus();
  };

  async function analizarYGuardar(texto) {
    const textLower = texto.toLowerCase();
    const categorias = [];
    const palabrasAlojamiento = ['camping','hotel','bungalow','apartamento','alojamiento','casa rural','hostal','cabana','parcela','hospedaje','dormir','quedarme','quiero ir','reservar'];
    const palabrasLugar = ['playa','cala','nudista','naturista','nudismo'];
    const palabrasAforo = ['gente','llena','tranquila','concurrida','aforo','ambiente','mucha gente','poca gente'];
    const palabrasVisita = ['ir a','visitar','quedar','fin de semana','vacaciones','verano','cuando','puedo ir'];
    if (palabrasAlojamiento.some(p => textLower.includes(p))) categorias.push('alojamiento');
    if (palabrasLugar.some(p => textLower.includes(p))) categorias.push('lugar');
    if (palabrasAforo.some(p => textLower.includes(p))) categorias.push('aforo');
    if (palabrasVisita.some(p => textLower.includes(p))) categorias.push('visita');
    const provincias = ['almeria','cadiz','granada','huelva','malaga','sevilla','cordoba','jaen','alicante','castellon','valencia','barcelona','girona','lleida','tarragona','baleares','canarias','murcia','cantabria','asturias','galicia','navarra','aragon','madrid','toledo','albacete','ciudad real','cuenca','guadalajara','badajoz','caceres','la rioja','burgos','leon','palencia','salamanca','segovia','soria','valladolid','zamora','pontevedra','a coruna','lugo','ourense'];
    const provinciaDetectada = provincias.find(p => textLower.includes(p)) || null;
    if (categorias.length === 0 && !provinciaDetectada) return;
    try {
      const url = 'https://firestore.googleapis.com/v1/projects/nudisol/databases/(default)/documents/solito_consultas';
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            texto: { stringValue: texto.substring(0, 200) },
            categorias: { arrayValue: { values: categorias.map(c => ({ stringValue: c })) } },
            provincia: { stringValue: provinciaDetectada || '' },
            timestamp: { timestampValue: new Date().toISOString() }
          }
        })
      });
    } catch(e) {}
  }

  async function llamarAPI(mensajes) {
    const response = await fetch('https://solito-proxy.plopezcastello.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: mensajes
      })
    });
    if (!response.ok) throw new Error('API error ' + response.status);
    const data = await response.json();
    return data.content[0].text;
  }

  let reconocimiento = null;

  window.solitoMic = function() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      agregarMensaje('bot', 'Tu navegador no soporta el microfono. Prueba con Chrome. 🌞');
      return;
    }
    const btn = document.getElementById('solito-mic');
    const input = document.getElementById('solito-input');
    if (reconocimiento) {
      reconocimiento.stop(); reconocimiento = null;
      btn.classList.remove('escuchando'); btn.textContent = '🎤';
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    reconocimiento = new SR();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;
    btn.classList.add('escuchando'); btn.textContent = '⏹';
    reconocimiento.onresult = function(e) {
      input.value = e.results[0][0].transcript;
      btn.classList.remove('escuchando'); btn.textContent = '🎤';
      reconocimiento = null;
      window.solitoEnviar();
    };
    reconocimiento.onerror = reconocimiento.onend = function() {
      btn.classList.remove('escuchando'); btn.textContent = '🎤';
      reconocimiento = null;
    };
    reconocimiento.start();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', crearUI);
  } else {
    crearUI();
  }

})();