/*
 * MOTOR DE LA EXPERIENCIA
 * Recorre el guion (guion.js) como una máquina de estados que solo avanza:
 *   portada → configurar delegado → explicación de VOCERO (postura inicial)
 *   → por cada momento: presenta + actúas → responde → revisas
 *   → votación → consecuencias → lo que no viste → resumen
 * Cada pantalla de momento muestra la sala de la asamblea con los personajes;
 * los diálogos avanzan cuando la persona toca la pantalla.
 * Toda la partida vive en un objeto `partida` que se guarda en el navegador
 * (localStorage) en cada paso. Nada se envía a internet.
 */
(function () {
  "use strict";
  const BASE = window.GUION;
  // G = guion de la versión en juego: lo común (BASE) + lo propio de la versión
  let G = BASE;
  function usarVersion(id) {
    const v = BASE.versiones.find((x) => x.id === id) || BASE.versiones[0];
    G = Object.assign({}, BASE, v, {
      explicacion: Object.assign({}, BASE.explicacion, v.explicacion),
      cierre: Object.assign({}, BASE.cierre, v.cierre),
    });
    return v.id;
  }
  const versionAlAzar = () => BASE.versiones[Math.floor(Math.random() * BASE.versiones.length)].id;
  usarVersion(BASE.versiones[0].id);
  const CLAVE = "vocero-partida-v1";
  const CONDUCTOR = new URLSearchParams(location.search).has("conductor");
  const REDUCIDO = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const app = document.getElementById("app");
  const nada = () => {};
  // Si no hay módulo de sonido, cualquier llamada S.algo() no hace nada
  const S = window.SONIDO || new Proxy({}, { get: (o, k) => (k === "activo" ? false : nada) });
  const IDS_PJ = Object.keys(window.GUION.personajes);

  // ---------- Secuencia de pasos ----------
  const PASOS = [{ tipo: "portada" }, { tipo: "config" }, { tipo: "explicacion" }];
  G.momentos.forEach((m, i) => {
    PASOS.push({ tipo: "presenta", i }, { tipo: "responde", i }, { tipo: "revisa", i });
  });
  PASOS.push({ tipo: "cierre" }, { tipo: "consecuencias" }, { tipo: "noViste" }, { tipo: "resumen" });

  // ---------- Estado ----------
  function nuevaPartida() {
    return {
      paso: 0,
      version: versionAlAzar(),
      codigo: "",
      perfil: null,
      prioridades: [],
      posturas: [], // {momento: 'inicial'|'m1'..., nivel, razon}
      acciones: {}, // {m1: 'a', ...}
      cierre: {},
      volteadas: [], // respuestas ocultas que abrió al final
      comentarioOculto: "",
      tiempos: {},
      inicio: null,
      fin: null,
      conductor: CONDUCTOR,
    };
  }
  let partida = Object.assign(nuevaPartida(), cargar() || {});
  partida.version = usarVersion(partida.version);
  let recuperada = partida.paso > 0 && partida.paso < PASOS.length - 1;
  let entradaPaso = Date.now();
  let temp = {}; // selecciones dentro de la pantalla actual
  let medidorPrevio = null;
  let dlgToken = 0;

  function cargar() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE));
    } catch (e) {
      return null;
    }
  }
  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(partida));
    } catch (e) {
      /* sin almacenamiento: el juego sigue funcionando */
    }
  }

  // ---------- Utilidades ----------
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => n.toLocaleString("es-CO");
  const prio1 = () => partida.prioridades[0];
  const perfil = () => G.perfiles.find((p) => p.id === partida.perfil);
  function t(x) {
    let s = typeof x === "string" ? x : x[prio1()] ?? Object.values(x)[0];
    return s.replace(/\{perfil\}/g, perfil() ? perfil().nombre : "ciudadano");
  }
  const parrafos = (arr) => (Array.isArray(arr) ? arr : [arr]).map((p) => `<p>${esc(t(p))}</p>`).join("");
  const nombrePostura = (n) => (G.posturas.find((p) => p.nivel === n) || {}).nombre || "—";
  const ultimaPostura = () => partida.posturas[partida.posturas.length - 1];
  const nombrePrioridad = (id) => (G.prioridades.find((p) => p.id === id) || {}).nombre;
  const despues = (ms, fn) => (REDUCIDO || ms <= 0 ? fn() : setTimeout(fn, ms));
  function duracion(ms) {
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
  }
  function claveTiempo(paso) {
    if (paso.i !== undefined) return `${G.momentos[paso.i].id.toUpperCase()} ${paso.tipo}`;
    return paso.tipo;
  }
  function nombreDe(l) {
    if (l.quien === "vocero") return "VOCERO";
    if (l.quien === "tu") return "Tú";
    if (l.quien === "documento") return l.titulo || "Documento";
    if (l.quien === "narrador") return "";
    return (G.personajes[l.quien] || {}).nombre || l.quien;
  }

  // ---------- Ilustraciones ----------
  function avatarSVG(p, mini) {
    const acc = (p.acc || "").split(" ");
    const { piel, pelo, ropa } = p;
    const base = `<path d="M29 47 C27 21 73 21 71 47 C68 34 60 29 50 30 C40 29 32 34 29 47Z" fill="${pelo}"/>`;
    let detras = "",
      frente = base;
    switch (p.peinado) {
      case "largo":
        detras = `<path d="M27 46 C25 15 75 15 73 46 L76 86 C60 92 40 92 24 86 Z" fill="${pelo}"/>`;
        break;
      case "mono":
        frente = `<circle cx="50" cy="20" r="9" fill="${pelo}"/>` + base;
        break;
      case "cola":
        detras = `<ellipse cx="73" cy="46" rx="6" ry="13" fill="${pelo}"/>`;
        break;
      case "trenza":
        detras = [52, 62, 72, 81].map((y, k) => `<circle cx="${73 - k * 0.6}" cy="${y}" r="${5 - k * 0.5}" fill="${pelo}"/>`).join("");
        break;
      case "rizado":
        frente = [[34, 37], [40, 27], [50, 23], [60, 27], [66, 37], [30, 46], [70, 46]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${pelo}"/>`)
          .join("");
        break;
      case "calvo":
        frente = `<path d="M29 44 C29 36 33 34 34 40 L33 52 C30 50 29 47 29 44Z M71 44 C71 36 67 34 66 40 L67 52 C70 50 71 47 71 44Z" fill="${pelo}"/>`;
        break;
    }
    let ropaExtra = "";
    if (acc.includes("bata"))
      ropaExtra += `<path d="M40 78 L50 100 L60 78" fill="none" stroke="#c9c9c9" stroke-width="2"/><path d="M41 80 Q38 102 50 106 Q62 102 59 80" stroke="#4a6fa5" stroke-width="2.2" fill="none"/>`;
    if (acc.includes("corbata"))
      ropaExtra += `<path d="M41 77 L50 89 L59 77Z" fill="#fff"/><path d="M48 83 L52 83 L54 105 L50 110 L46 105Z" fill="#b03a2e"/>`;
    let cabeza = "";
    if (acc.includes("sombrero"))
      cabeza += `<ellipse cx="50" cy="30" rx="31" ry="6" fill="#c9a56a"/><path d="M34 30 C34 11 66 11 66 30Z" fill="#dcbb7e"/><rect x="34" y="23" width="32" height="4" fill="#7a4a2e"/>`;
    if (acc.includes("gorra"))
      cabeza += `<path d="M29 37 C29 17 71 17 71 37Z" fill="#c0392b"/><path d="M52 34 L84 37 C82 41 62 41 52 39Z" fill="#a93226"/>`;
    if (acc.includes("casco"))
      cabeza += `<path d="M27 38 C27 13 73 13 73 38Z" fill="#f2c230"/><rect x="23" y="35" width="54" height="5" rx="2" fill="#e0ad1d"/><rect x="47" y="15" width="6" height="21" fill="#e0ad1d"/>`;
    if (acc.includes("gafas"))
      cabeza += `<g fill="rgba(255,255,255,.25)" stroke="#222" stroke-width="1.6"><circle cx="43" cy="48" r="6"/><circle cx="57" cy="48" r="6"/></g><path d="M49 48 L51 48" stroke="#222" stroke-width="1.6"/>`;
    if (acc.includes("bigote")) cabeza += `<path d="M42 57 Q50 52 58 57 Q50 59.5 42 57Z" fill="${pelo}"/>`;
    const carpeta = acc.includes("carpeta")
      ? `<rect x="58" y="95" width="24" height="17" rx="2" fill="#e6c15a" stroke="#b8932f" transform="rotate(-10 70 103)"/>`
      : "";
    const vb = mini ? "24 14 52 52" : "0 0 100 120";
    return `<svg viewBox="${vb}" aria-hidden="true" class="av">
      ${detras}
      <path d="M15 121 C15 86 30 76 50 76 C70 76 85 86 85 121Z" fill="${ropa}"/>${ropaExtra}
      <rect x="44" y="63" width="12" height="15" rx="3" fill="${piel}"/><rect x="44" y="70" width="12" height="4" fill="rgba(0,0,0,.08)"/>
      <circle cx="30" cy="49" r="4.2" fill="${piel}"/><circle cx="70" cy="49" r="4.2" fill="${piel}"/>
      <ellipse cx="50" cy="47" rx="20" ry="23" fill="${piel}"/>
      <path d="M39 42 Q43 40 47 42 M53 42 Q57 40 61 42" stroke="${pelo}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <g class="ojos" fill="#24160f"><ellipse cx="43" cy="48" rx="2.3" ry="2.8"/><ellipse cx="57" cy="48" rx="2.3" ry="2.8"/></g>
      <path d="M50 50 Q47.5 55 51 55.5" stroke="rgba(0,0,0,.25)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <circle cx="37.5" cy="55" r="3.2" fill="#e05a5a" opacity=".18"/><circle cx="62.5" cy="55" r="3.2" fill="#e05a5a" opacity=".18"/>
      <ellipse class="boca" cx="50" cy="60.5" rx="4.6" ry="1.5" fill="#7a2e2e"/>
      ${frente}${cabeza}${carpeta}
    </svg>`;
  }

  const orbe = (clase = "") => `<span class="orbe ${clase}"><span class="ojo"></span><span class="ojo"></span></span>`;

  function figura(id, k) {
    const p = G.personajes[id];
    return `<figure class="pj" data-pj="${id}" style="--d:${((k * 1.3) % 4).toFixed(1)}s">
      <span class="globo"><i></i><i></i><i></i></span>
      ${avatarSVG(p)}
      <figcaption>${esc(p.nombre)}<small>${esc(p.rol)}</small></figcaption>
    </figure>`;
  }

  function sala(ids, pantalla, clase = "") {
    return `<div class="sala ${clase}" aria-hidden="true">
      <div class="luz"></div>
      <div class="pantalla-sala"><span>${esc(pantalla)}</span></div>
      <div class="fila-fondo">${ids.map(figura).join("")}</div>
      <div class="mesa"></div>
      <div class="pj-vocero" data-pj="vocero">${orbe()}<span class="nombre">VOCERO</span></div>
    </div>`;
  }

  function salaMomento(m) {
    // todos los que responden están presentes en la sala
    const ids = [...m.sala];
    m.acciones.forEach((a) => {
      if (G.personajes[a.quien] && !ids.includes(a.quien)) ids.push(a.quien);
    });
    return sala(ids, m.pantalla);
  }

  // ---------- Diálogo ----------
  function dialogo() {
    return `<div class="dialogo" aria-live="polite"></div>
      <button type="button" class="avanzar">Toca para continuar <span>▸</span></button>`;
  }

  function lineaHTML(l) {
    const txt = esc(t(l.texto));
    if (l.quien === "narrador") return `<div class="linea narrador">${txt}</div>`;
    if (l.quien === "tu")
      return `<div class="linea tu"><div class="texto"><b>Tú</b>${txt}</div><span class="mini">${avatarSVG(G.personajes.tu, true)}</span></div>`;
    let mini;
    if (l.quien === "vocero") mini = orbe("mini");
    else if (l.quien === "documento") mini = `<span class="doc">📄</span>`;
    else mini = avatarSVG(G.personajes[l.quien], true);
    return `<div class="linea otro l-${esc(l.quien)}"><span class="mini">${mini}</span><div class="texto"><b>${esc(nombreDe(l))}</b>${txt}</div></div>`;
  }

  function marcar(quien) {
    const s = app.querySelector(".sala");
    if (!s) return;
    s.querySelectorAll(".habla, .escribe").forEach((e) => e.classList.remove("habla", "escribe"));
    const el = quien && s.querySelector(`[data-pj="${quien}"]`);
    s.classList.toggle("hay-hablante", !!el);
    if (el) el.classList.add("habla");
  }

  function escribiendo(quien, log) {
    const s = app.querySelector(".sala");
    const el = s && s.querySelector(`[data-pj="${quien}"]`);
    if (el) el.classList.add("escribe");
    if (quien === "vocero") S.piensa();
    log.insertAdjacentHTML("beforeend", `<div class="linea escribiendo"><span class="puntos"><i></i><i></i><i></i></span></div>`);
    verAbajo(log.lastElementChild);
  }

  function verAbajo(el) {
    if (el && el.scrollIntoView && !REDUCIDO) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function iniciarDialogo(lineas) {
    const tok = ++dlgToken;
    const log = app.querySelector(".dialogo");
    const btn = app.querySelector(".avanzar");
    const tras = app.querySelector(".tras");
    let k = 0,
      ocupado = false;

    function terminar() {
      btn.classList.add("oculto");
      if (tras) {
        tras.classList.remove("oculto");
        tras.classList.add("aparece");
        verAbajo(tras);
      }
    }
    function listo() {
      ocupado = false;
      if (k >= lineas.length) terminar();
      else {
        btn.classList.remove("oculto");
        btn.focus({ preventScroll: true });
      }
    }
    function paso() {
      if (tok === dlgToken && !ocupado) S.callar(); // al avanzar, VOCERO deja de hablar
      if (tok !== dlgToken || ocupado) return;
      if (k >= lineas.length) return terminar();
      const l = lineas[k++];
      ocupado = true;
      btn.classList.add("oculto");
      if (l.tipo === "log") return correrLog(l, log, tok, () => listo() || paso());
      const espera = Math.min(1100, 350 + t(l.texto).length * 7);
      if (l.quien !== "narrador") escribiendo(l.quien, log);
      despues(espera, () => {
        if (tok !== dlgToken) return;
        const e = log.querySelector(".escribiendo");
        if (e) e.remove();
        log.insertAdjacentHTML("beforeend", lineaHTML(l));
        marcar(l.quien);
        if (l.quien === "vocero") S.vocero(t(l.texto));
        else if (l.quien === "tu") S.envio();
        else if (l.quien !== "narrador") S.mensaje(Math.max(0, IDS_PJ.indexOf(l.quien)));
        verAbajo(log.lastElementChild);
        listo();
      });
    }
    btn.addEventListener("click", paso);
    log.addEventListener("click", paso);
    const s = app.querySelector(".sala");
    if (s) s.addEventListener("click", paso);
    paso();
  }

  // El registro técnico de la negociación: miles de líneas reales que corren
  function lineaLog(n) {
    const r = (k) => (((n * 9301 + k * 49297) * 233 + k * 7) % 233280) / 233280;
    const id = (k) => String(Math.floor(r(k) * 99999)).padStart(5, "0");
    const d = (k) => (r(k) > 0.5 ? "+" : "-") + (r(k + 11) * 0.05).toFixed(3);
    const L = "ABCDEFGH";
    const tipo = ["ofr", "contra", "acepta", "rechaza", "coalición"][Math.floor(r(5) * 5)];
    return `r#${String(n).padStart(7, "0")} dlg[${L[Math.floor(r(1) * 8)]}-${id(2)}]→dlg[${L[Math.floor(r(3) * 8)]}-${id(4)}] ${tipo}{cob:${d(6)},men:${d(8)},loc:${d(9)}} w=${r(10).toFixed(2)}`;
  }

  function correrLog(l, cont, tok, fin) {
    const MAX = 3000;
    cont.insertAdjacentHTML(
      "beforeend",
      `<div class="log-caja"><div class="log-cab"><span>registro_negociacion.log</span><span class="log-cont">0 / ${fmt(l.total)}</span></div><pre class="log" tabindex="0"></pre></div>`
    );
    const caja = cont.lastElementChild;
    const pre = caja.querySelector("pre");
    const contador = caja.querySelector(".log-cont");
    marcar("vocero");
    let n = 0;
    function lote(c) {
      let s = "";
      for (let j = 0; j < c && n < MAX; j++) s += lineaLog(++n) + "\n";
      pre.appendChild(document.createTextNode(s));
      pre.scrollTop = pre.scrollHeight;
      S.datos();
      contador.textContent = `línea ${fmt(n)} de ${fmt(l.total)}`;
    }
    function acabar() {
      S.finDatos();
      pre.appendChild(document.createTextNode(`… y faltan ${fmt(l.total - MAX)} líneas más.\n`));
      pre.scrollTop = pre.scrollHeight;
      const dias = Math.round((l.total * 2) / 86400);
      caja.insertAdjacentHTML(
        "beforeend",
        `<p class="log-nota">Puedes desplazarte por el registro. Leyendo una línea cada 2 segundos, tardarías unos ${dias} días sin parar.</p><button type="button" class="btn log-btn">${esc(
          l.boton || "Continuar"
        )}</button>`
      );
      const b = caja.querySelector(".log-btn");
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        b.remove();
        fin();
      });
      b.focus({ preventScroll: true });
      verAbajo(b);
    }
    verAbajo(caja);
    if (REDUCIDO) {
      lote(MAX);
      return acabar();
    }
    const iv = setInterval(() => {
      if (tok !== dlgToken) return clearInterval(iv);
      lote(45);
      if (n >= MAX) {
        clearInterval(iv);
        acabar();
      }
    }, 30);
  }

  // Reacciones del público al cambiar de postura
  function reacciones() {
    S.murmullo();
    const iconos = ["🤔", "😮", "👀", "Mmm…", "¡Uy!", "💬", "😕"];
    app.querySelectorAll(".sala .pj").forEach((pj, k) => {
      if (Math.random() < 0.3 && k > 0) return;
      const r = document.createElement("span");
      r.className = "reaccion";
      r.style.setProperty("--x", `${Math.round(Math.random() * 30 - 15)}px`);
      r.style.animationDelay = `${k * 0.12}s`;
      r.textContent = iconos[Math.floor(Math.random() * iconos.length)];
      pj.appendChild(r);
      setTimeout(() => r.remove(), 2000);
    });
  }

  // ---------- Componentes ----------
  function encabezado(paso) {
    const pct = Math.round((partida.paso / (PASOS.length - 1)) * 100);
    const u = ultimaPostura();
    let medidor = "";
    if (u && !["portada", "resumen"].includes(paso.tipo)) {
      medidor = `<div class="medidor" aria-label="Tu postura actual: ${esc(nombrePostura(u.nivel))}">
        <span class="medidor-etq">Tu postura</span>
        <div class="medidor-barra">${G.posturas.map((p) => `<span class="seg n${p.nivel}" title="${esc(p.nombre)}"></span>`).join("")}
          <span class="aguja" data-nivel="${u.nivel}" style="left:${((medidorPrevio ?? u.nivel) - 0.5) * 20}%"></span></div>
        <span class="medidor-nombre">${esc(nombrePostura(u.nivel))}</span>
      </div>`;
    }
    return `<header class="top">
      <div class="marca">VOCERO<span>·</span><small>¿Lo firmarías?</small>
        ${partida.paso > 0 ? `<button type="button" class="nueva-btn" data-accion="nueva" title="Empezar una nueva partida">↺ <span>Nueva partida</span></button>` : ""}
        <button type="button" class="sonido-btn" data-accion="sonido" aria-pressed="${S.activo}" title="Activar o silenciar sonidos">${S.activo ? "🔊" : "🔇"}</button></div>
      ${medidor}
      <div class="progreso" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
    </header>`;
  }

  function fases(activas) {
    const nombres = ["Se presenta", "Actúas", "Responde", "Revisas"];
    return `<ol class="fases">${nombres.map((n, k) => `<li class="${activas.includes(k) ? "on" : ""}">${k + 1}. ${n}</li>`).join("")}</ol>`;
  }

  function cabMomento(m, i) {
    const badge = m.toca.includes(prio1())
      ? `<div class="badge">⚠ Esto toca lo que le pediste a tu delegado: ${esc(nombrePrioridad(prio1()))}</div>`
      : "";
    return `<div class="momento-cab"><span class="num">Momento ${i + 1} de ${G.momentos.length}</span>
      <h2 tabindex="-1">${esc(m.titulo)}</h2><span class="mirada">${esc(m.mirada)}</span></div>${badge}`;
  }

  function formPostura(pregunta, razonObligatoria, ayuda) {
    const u = ultimaPostura();
    return `<fieldset class="postura">
      <legend>${esc(pregunta)}</legend>
      <div class="escala">${G.posturas
        .map(
          (p) => `<label class="op n${p.nivel}">
            <input type="radio" name="nivel" value="${p.nivel}" ${u && u.nivel === p.nivel ? "checked" : ""}>
            <span>${esc(p.nombre)}${u && u.nivel === p.nivel ? "<em>tu postura anterior</em>" : ""}</span></label>`
        )
        .join("")}</div>
      <label class="campo">${razonObligatoria ? "¿Por qué? (obligatorio)" : esc(ayuda)}
        <textarea name="razon" rows="3" placeholder="Escribe con tus palabras…"></textarea>
      </label>
    </fieldset>`;
  }

  function botonSeguir(texto = "Continuar") {
    return `<div class="error" role="alert"></div><button class="btn primario" data-accion="siguiente">${esc(texto)} →</button>`;
  }

  // ---------- Pantallas ----------
  // Cada pantalla devuelve su HTML; `alMostrar` (opcional) arranca el diálogo.
  const pantallas = {
    portada() {
      return `<div class="portada">
        ${sala(["marta", "efrain", "moderadora", "luisa", "rosalba"], "Asamblea pública · Alimentación escolar", "hero")}
        <p class="sobre">${esc(G.subtitulo)}</p>
        <h1 tabindex="-1">${esc(G.titulo)}</h1>
        <div class="pregunta"><span>La pregunta de esta experiencia</span>${esc(G.pregunta)}</div>
        <section class="rol"><h3>${esc(G.rol.titulo)}</h3>${parrafos(G.rol.texto)}
          <div class="dos">
            <div><h4>Puedes</h4><ul>${G.rol.puedes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
            <div><h4>No puedes</h4><ul>${G.rol.noPuedes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
          </div>
          <p class="nota">Dura unos 15 a 20 minutos. No hay respuestas correctas. Los diálogos avanzan cuando tocas la pantalla. No escribas tu nombre ni datos personales.</p>
        </section>
        <label class="campo corto">Código de participante (lo asigna quien conduce, por ejemplo P1)
          <input name="codigo" maxlength="12" value="${esc(partida.codigo || "P1")}" autocomplete="off">
        </label>
        ${
          CONDUCTOR
            ? `<label class="campo corto selector-version">Versión de la historia (solo la ve quien conduce)
          <select name="version"><option value="">Al azar</option>${BASE.versiones
            .map((v, k) => `<option value="${v.id}">${k + 1}. ${esc(v.nombre)} · foco ${esc(v.foco)}</option>`)
            .join("")}</select></label>`
            : ""
        }
        ${botonSeguir("Entrar a la asamblea")}
        <p class="enlaces"><a href="guia.html">Guía para quien conduce la prueba</a>${
          CONDUCTOR ? "" : ` · <a href="?conductor=1">Abrir en modo conductor</a>`
        }</p></div>`;
    },

    config() {
      temp.orden = temp.orden || [...partida.prioridades];
      const orden = temp.orden;
      const aprendido = orden.length
        ? orden.map((id, k) => `<span class="chip">${k + 1}. ${esc(nombrePrioridad(id))}</span>`).join("")
        : `<span class="chip vacio">Esperando tus prioridades…</span>`;
      return `<div class="vocero-hero">${orbe(`grande ${temp.aprende ? "aprende" : ""}`)}
          <div><h2 tabindex="-1">Configura tu delegado</h2><p>VOCERO te representará según lo que le digas aquí.</p>
          <div class="aprendido">${aprendido}</div></div></div>
        <fieldset><legend>1. ¿Quién eres en esta historia?</legend>
          <div class="opciones">${G.perfiles
            .map(
              (p) => `<label class="op"><input type="radio" name="perfil" value="${p.id}" ${
                (temp.perfil ?? partida.perfil) === p.id ? "checked" : ""
              }><span>${esc(p.corto)}</span></label>`
            )
            .join("")}</div></fieldset>
        <fieldset><legend>2. Ordena tus prioridades: toca primero la más importante</legend>
          <div class="prioridades">${G.prioridades
            .map((p) => {
              const k = orden.indexOf(p.id);
              return `<button type="button" class="prio ${k >= 0 ? "elegida" : ""}" data-accion="prio" data-id="${p.id}">
                <span class="rank">${k >= 0 ? k + 1 : "·"}</span><span><strong>${esc(p.nombre)}</strong><small>${esc(p.desc)}</small></span></button>`;
            })
            .join("")}</div>
          <button type="button" class="btn texto" data-accion="reordenar">Reiniciar orden</button>
        </fieldset>
        ${botonSeguir("Enviar a mi delegado")}`;
    },

    explicacion() {
      return `<h2 tabindex="-1">Tu delegado votó</h2>
        ${sala([], G.explicacion.pantalla, "privada")}
        ${dialogo()}
        <div class="tras oculto">
          <p class="nota">${esc(G.explicacion.nota)}</p>
          ${formPostura("Con lo que sabes ahora, ¿cuál es tu postura frente al acuerdo?", true)}
          ${botonSeguir("Ir a la asamblea")}
        </div>`;
    },

    presenta(p) {
      const m = G.momentos[p.i];
      return `${fases([0, 1])}${cabMomento(m, p.i)}
        ${salaMomento(m)}
        ${dialogo()}
        <div class="tras oculto">
          <h3 class="que-haces">✋ Levanta la mano <small>Elige una sola acción</small></h3>
          <div class="acciones">${m.acciones
            .map((a) => {
              const mini =
                a.quien === "vocero" ? orbe("mini") : a.quien === "documento" ? `<span class="doc">📄</span>` : avatarSVG(G.personajes[a.quien], true);
              return `<button class="accion" data-accion="actuar" data-id="${a.id}"><span class="mini">${mini}</span><span>${esc(a.etiqueta)}</span></button>`;
            })
            .join("")}</div>
        </div>`;
    },

    responde(p) {
      const m = G.momentos[p.i];
      return `${fases([2])}${cabMomento(m, p.i)}
        ${salaMomento(m)}
        ${dialogo()}
        <div class="tras oculto">${botonSeguir()}</div>`;
    },

    revisa(p) {
      const m = G.momentos[p.i];
      return `${fases([3])}${cabMomento(m, p.i)}
        ${salaMomento(m)}
        ${dialogo()}
        <div class="tras oculto">
          ${formPostura("Después de esto, ¿dónde estás?", false, "¿Qué te hizo mantener o cambiar tu postura? (obligatorio si cambias)")}
          ${botonSeguir(p.i === G.momentos.length - 1 ? "Ir a la votación" : "Siguiente momento")}
        </div>`;
    },

    cierre() {
      const c = G.cierre;
      return `<h2 tabindex="-1">La votación</h2>
        ${sala(c.sala, c.pantalla, "votacion")}
        ${dialogo()}
        <div class="tras oculto">
        <div class="pregunta"><span>Recuerda la pregunta</span>${esc(G.pregunta)}</div>
        <fieldset><legend>1. ¿Qué haces con el acuerdo?</legend>
          <div class="opciones grandes">${c.decisiones
            .map(
              (d) => `<label class="op dec-${d.id}"><input type="radio" name="decision" value="${d.id}"><span><strong>${esc(d.nombre)}</strong><small>${esc(
                d.desc
              )}</small></span></label>`
            )
            .join("")}</div>
          <div class="condiciones oculto">
            <p>Elige hasta ${c.maxCondiciones} condiciones:</p>
            ${c.condiciones.map((x) => `<label class="check"><input type="checkbox" name="cond" value="${x.id}"> ${esc(x.nombre)}</label>`).join("")}
          </div>
        </fieldset>
        <fieldset><legend>2. Si el acuerdo sale mal, ¿quién debería responder?</legend>
          <div class="opciones">${c.responsables
            .map((r) => `<label class="op"><input type="radio" name="responsable" value="${r.id}"><span>${esc(r.nombre)}</span></label>`)
            .join("")}</div>
          <label class="campo">¿Por qué? (obligatorio)
            <textarea name="justificacion" rows="2"></textarea></label>
        </fieldset>
        <fieldset><legend>3. Responde la pregunta con tus palabras</legend>
          <label class="campo">¿Puedes respaldar y responder por una decisión que tu delegado tomó en tu nombre? (obligatorio)
            <textarea name="reflexion" rows="4"></textarea></label>
        </fieldset>
        ${botonSeguir("Depositar mi voto")}
        </div>`;
    },

    consecuencias() {
      const c = G.cierre;
      const d = c.decisiones.find((x) => x.id === partida.cierre.decision);
      const r = c.responsables.find((x) => x.id === partida.cierre.responsable);
      const conds = (partida.cierre.condiciones || []).map((id) => c.condiciones.find((x) => x.id === id));
      return `<div class="urna-escena" aria-hidden="true">
          <div class="papeleta dec-${d.id}">${esc(d.nombre)}</div>
          <div class="urna"><span class="ranura"></span><span class="rotulo">VOTO CIUDADANO</span></div>
          <div class="registrado">✓ Voto registrado</div>
        </div>
        <div class="tras-voto">
        <h2 tabindex="-1">Votaste: ${esc(d.nombre)}</h2>
        <div class="burbuja dec dec-${d.id}"><div class="voz">Lo que pasa ahora</div><p>${esc(d.consecuencia)}</p></div>
        ${
          conds.length
            ? `<h3>Tus condiciones y lo que cuestan</h3><ul class="costos">${conds
                .map((x) => `<li><strong>${esc(x.nombre)}</strong><span>${esc(x.costo)}</span></li>`)
                .join("")}</ul>`
            : ""
        }
        <h3>Sobre quién responde</h3>
        <div class="burbuja contra"><div class="voz">Dijiste: ${esc(r.nombre)}</div><p>${esc(r.contrapunto)}</p></div>
        <p class="nota">Ninguna opción es gratis: cada una le cuesta algo a alguien.</p>
        ${botonSeguir("Una última cosa")}
        </div>`;
    },

    noViste() {
      let total = 0,
        ocultasN = 0;
      const bloques = G.momentos
        .map((m) => {
          const ocultas = m.acciones.filter((a) => a.id !== partida.acciones[m.id]);
          total += m.acciones.length;
          ocultasN += ocultas.length;
          return `<h3 class="nv-titulo">${esc(m.titulo)}</h3><div class="cartas">${ocultas
            .map((a) => {
              const clave = `${m.id}-${a.id}`;
              const vuelta = partida.volteadas.includes(clave);
              const dorso = a.respuesta
                .filter((l) => !l.tipo)
                .map((l) => `<span class="ldorso">${l.quien === "narrador" ? "" : `<b>${esc(nombreDe(l))}:</b> `}${esc(t(l.texto))}</span>`)
                .join("");
              return `<button type="button" class="flip ${vuelta ? "volteada" : ""}" data-accion="voltear" data-id="${clave}" aria-pressed="${vuelta}">
                <span class="cara frente"><span class="interrog">?</span><b>${esc(a.etiqueta)}</b><small>Toca para ver</small></span>
                <span class="cara dorso">${dorso}</span></button>`;
            })
            .join("")}</div>`;
        })
        .join("");
      const vistas = total - ocultasN;
      return `<h2 tabindex="-1">Lo que no viste</h2>
        <p class="grande">Votaste conociendo <strong>${vistas} de ${total}</strong> respuestas posibles (${Math.round((vistas / total) * 100)} %).</p>
        <p>Igual que tu delegado, tú también decidiste con una parte del acuerdo. Toca las cartas para descubrir lo que quedó oculto:</p>
        ${bloques}
        <label class="campo">Ahora que lo ves, ¿cambiarías algo de tu voto o de tu respuesta? (opcional)
          <textarea name="comentario" rows="3">${esc(partida.comentarioOculto)}</textarea></label>
        ${botonSeguir("Ver mi recorrido")}`;
    },

    resumen() {
      const filas = partida.posturas
        .map((p, k) => {
          const etq = p.momento === "inicial" ? "Inicio" : G.momentos.find((m) => m.id === p.momento).titulo;
          return `<li style="--k:${k}"><span class="etq">${esc(etq)}</span>
            <span class="pista">${G.posturas.map((x) => `<i class="${x.nivel === p.nivel ? "on n" + x.nivel : ""}"></i>`).join("")}</span>
            <span class="nom">${esc(nombrePostura(p.nivel))}</span></li>`;
        })
        .join("");
      const d = G.cierre.decisiones.find((x) => x.id === partida.cierre.decision);
      return `<h2 tabindex="-1">Tu recorrido</h2>
        <p>Así se movió tu postura durante la asamblea, hasta que votaste <strong>${esc(d.nombre)}</strong>.</p>
        <ul class="trayectoria">${filas}</ul>
        <div class="gracias">Gracias por participar. Ahora conversa con quien conduce: ¿qué te hizo cambiar o mantener tu postura?</div>
        <h3>Registro para el grupo</h3>
        <p class="nota">Este texto se queda en este dispositivo. Cópialo o descárgalo para el registro de la prueba (apartado 3).</p>
        <pre class="registro">${esc(textoResumen())}</pre>
        <div class="fila-botones">
          <button class="btn primario" data-accion="copiar">Copiar registro</button>
          <button class="btn" data-accion="descargar">Descargar .txt</button>
          <button class="btn texto" data-accion="nueva">Nueva partida</button>
        </div><div class="error" role="status"></div>`;
    },
  };

  // Qué diálogo arranca en cada pantalla
  const dialogos = {
    explicacion: () => G.explicacion.lineas[prio1()] || Object.values(G.explicacion.lineas)[0],
    presenta: (p) => G.momentos[p.i].dialogo,
    responde: (p) => {
      const m = G.momentos[p.i];
      const a = m.acciones.find((x) => x.id === partida.acciones[m.id]);
      return [{ quien: "tu", texto: a.dice || a.etiqueta }, ...a.respuesta];
    },
    revisa: () => [G.revisa],
    cierre: () => G.cierre.dialogo,
  };

  // ---------- Guardar y validar cada pantalla ----------
  const valor = (sel) => app.querySelector(sel)?.value?.trim() ?? "";
  const radio = (name) => app.querySelector(`input[name="${name}"]:checked`)?.value ?? null;

  function leerPostura(momento, razonObligatoria) {
    const n = radio("nivel");
    const razon = valor('textarea[name="razon"]');
    if (!n) return "Elige una postura en la escala.";
    const u = ultimaPostura();
    if (razonObligatoria && !razon) return "Escribe brevemente por qué.";
    if (u && u.nivel !== +n && !razon) return "Cambiaste de postura: cuéntanos qué te hizo cambiar.";
    temp.cambio = !!u && u.nivel !== +n;
    partida.posturas.push({ momento, nivel: +n, razon });
    return null;
  }

  const guardarPaso = {
    portada() {
      partida.codigo = valor('input[name="codigo"]') || "P1";
      const elegida = valor('select[name="version"]');
      partida.version = usarVersion(elegida || partida.version);
      partida.inicio = partida.inicio || new Date().toISOString();
    },
    config() {
      const p = radio("perfil");
      if (!p) return "Elige quién eres en esta historia.";
      if ((temp.orden || []).length < G.prioridades.length) return "Ordena las tres prioridades tocándolas en orden.";
      partida.perfil = p;
      partida.prioridades = [...temp.orden];
    },
    explicacion: () => leerPostura("inicial", true),
    revisa: (p) => leerPostura(G.momentos[p.i].id, false),
    cierre() {
      const decision = radio("decision");
      const condiciones = [...app.querySelectorAll('input[name="cond"]:checked')].map((x) => x.value);
      const responsable = radio("responsable");
      const justificacion = valor('textarea[name="justificacion"]');
      const reflexion = valor('textarea[name="reflexion"]');
      if (!decision) return "Elige qué haces con el acuerdo.";
      if (decision === "condicionar" && !condiciones.length) return "Elige al menos una condición.";
      if (!responsable) return "Elige quién debería responder.";
      if (!justificacion) return "Explica por qué elegiste a ese responsable.";
      if (!reflexion) return "Responde la pregunta con tus palabras.";
      partida.cierre = { decision, condiciones: decision === "condicionar" ? condiciones : [], responsable, justificacion, reflexion };
    },
    noViste() {
      partida.comentarioOculto = valor('textarea[name="comentario"]');
      partida.fin = new Date().toISOString();
    },
  };

  function siguiente() {
    if (temp.bloqueado) return;
    const paso = PASOS[partida.paso];
    const fn = guardarPaso[paso.tipo];
    const err = fn ? fn(paso) : null;
    if (err) return mostrarError(err);
    const avanzar = () => {
      registrarTiempo(paso);
      const u = ultimaPostura();
      medidorPrevio = u ? u.nivel : null;
      partida.paso = Math.min(partida.paso + 1, PASOS.length - 1);
      temp = {};
      recuperada = false;
      guardar();
      render();
    };
    if (paso.tipo === "revisa" && temp.cambio && !REDUCIDO) {
      temp.bloqueado = true;
      reacciones();
      const tok = dlgToken;
      setTimeout(() => tok === dlgToken && avanzar(), 1300);
    } else avanzar();
  }

  function registrarTiempo(paso) {
    const k = claveTiempo(paso);
    partida.tiempos[k] = (partida.tiempos[k] || 0) + (Date.now() - entradaPaso);
  }

  function mostrarError(msg) {
    const e = [...app.querySelectorAll(".error")].pop();
    if (e) {
      e.textContent = msg;
      if (!msg.includes("✓")) S.error();
      e.classList.add("visible");
    }
  }

  // ---------- Resumen en texto ----------
  function textoResumen() {
    const L = [];
    const fecha = (iso) => (iso ? new Date(iso).toLocaleString("es-CO") : "—");
    const totalMs = partida.inicio && partida.fin ? new Date(partida.fin) - new Date(partida.inicio) : 0;
    const tiempoMomento = (id) =>
      duracion(["presenta", "responde", "revisa"].reduce((s, f) => s + (partida.tiempos[`${id.toUpperCase()} ${f}`] || 0), 0));
    L.push(`${G.titulo} — Registro de partida`);
    L.push(`Código: ${partida.codigo}`);
    L.push(`Inicio: ${fecha(partida.inicio)} · Duración total: ${duracion(totalMs)}`);
    L.push(`Versión de la historia: ${G.nombre} (foco: ${G.foco})`);
    L.push(`Modo conductor: ${partida.conductor ? "sí" : "no"}`);
    L.push(`Perfil: ${perfil() ? perfil().corto : "—"}`);
    L.push(`Prioridades: ${partida.prioridades.map((p, k) => `${k + 1}. ${nombrePrioridad(p)}`).join("  ")}`);
    L.push("");
    let anterior = null;
    const lineaPostura = (p) => {
      const cambio =
        anterior === null ? "" : anterior === p.nivel ? " (mantuvo)" : ` (cambió: ${nombrePostura(anterior)} → ${nombrePostura(p.nivel)})`;
      anterior = p.nivel;
      return `  Postura: ${nombrePostura(p.nivel)}${cambio}${p.razon ? `\n  Razón: «${p.razon}»` : ""}`;
    };
    const ini = partida.posturas.find((p) => p.momento === "inicial");
    L.push(`INICIO — Explicación de VOCERO (${duracion(partida.tiempos.explicacion || 0)})`);
    if (ini) L.push(lineaPostura(ini));
    G.momentos.forEach((m, i) => {
      const a = m.acciones.find((x) => x.id === partida.acciones[m.id]);
      const p = partida.posturas.find((x) => x.momento === m.id);
      L.push("");
      L.push(`M${i + 1} ${m.titulo} — ${m.mirada} (${tiempoMomento(m.id)})`);
      if (m.toca.includes(prio1())) L.push("  [Este momento tocaba su prioridad #1]");
      L.push(`  Acción: ${a ? a.etiqueta : "—"}`);
      if (p) L.push(lineaPostura(p));
    });
    const c = partida.cierre;
    if (c.decision) {
      const d = G.cierre.decisiones.find((x) => x.id === c.decision);
      const r = G.cierre.responsables.find((x) => x.id === c.responsable);
      const ocultas = G.momentos.reduce((s, m) => s + m.acciones.length - 1, 0);
      const total = G.momentos.reduce((s, m) => s + m.acciones.length, 0);
      L.push("");
      L.push(`CIERRE (${duracion(partida.tiempos.cierre || 0)})`);
      L.push(`  Decisión: ${d.nombre}`);
      if (c.condiciones.length)
        L.push(`  Condiciones: ${c.condiciones.map((id) => G.cierre.condiciones.find((x) => x.id === id).nombre).join("; ")}`);
      L.push(`  Quién debe responder: ${r.nombre}`);
      L.push(`  Por qué: «${c.justificacion}»`);
      L.push(`  Respuesta a la pregunta central: «${c.reflexion}»`);
      L.push("");
      L.push(`LO QUE NO VIO: ${ocultas} respuestas no vistas de ${total}`);
      L.push(`  Cartas que abrió al final: ${partida.volteadas.length} de ${ocultas}`);
      L.push(`  Comentario después de verlas: ${partida.comentarioOculto ? `«${partida.comentarioOculto}»` : "(no escribió)"}`);
    }
    L.push("");
    L.push("Notas del observador (completar a mano): dudas, ayudas dadas, expresiones en voz alta…");
    return L.join("\n");
  }

  // ---------- Eventos ----------
  app.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-accion]");
    if (!b) return;
    const acc = b.dataset.accion;
    if (!["sonido", "actuar", "voltear", "prio"].includes(acc)) S.click();
    const paso = PASOS[partida.paso];
    if (acc === "siguiente") siguiente();
    else if (acc === "prio") {
      const p = radio("perfil");
      if (p) temp.perfil = p;
      temp.orden = temp.orden || [];
      if (!temp.orden.includes(b.dataset.id)) temp.orden.push(b.dataset.id);
      temp.aprende = true;
      S.aprende();
      render(true);
    } else if (acc === "reordenar") {
      const p = radio("perfil");
      if (p) temp.perfil = p;
      temp.orden = [];
      temp.aprende = false;
      render(true);
    } else if (acc === "actuar") actuar(paso, b);
    else if (acc === "voltear") {
      const vuelta = b.classList.toggle("volteada");
      b.setAttribute("aria-pressed", vuelta);
      S.carta();
      if (vuelta && !partida.volteadas.includes(b.dataset.id)) {
        partida.volteadas.push(b.dataset.id);
        guardar();
      }
    } else if (acc === "sonido") {
      const on = S.alternar();
      b.textContent = on ? "🔊" : "🔇";
      b.setAttribute("aria-pressed", on);
    } else if (acc === "copiar") copiar();
    else if (acc === "descargar") descargar();
    else if (acc === "nueva" || acc === "descartar") nueva();
    else if (acc === "cerrar-aviso") {
      recuperada = false;
      app.querySelector(".aviso")?.remove();
    }
  });

  // Levantar la mano: el personaje al que le preguntas se ilumina
  function actuar(paso, b) {
    if (temp.bloqueado) return;
    const m = G.momentos[paso.i];
    const a = m.acciones.find((x) => x.id === b.dataset.id);
    partida.acciones[m.id] = a.id;
    if (REDUCIDO) return siguiente();
    temp.bloqueado = true;
    S.mano();
    app.querySelectorAll(".accion").forEach((x) => x.classList.toggle("elegida", x === b));
    const s = app.querySelector(".sala");
    if (s) {
      s.insertAdjacentHTML("beforeend", `<span class="mano">✋</span>`);
      s.scrollIntoView && s.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    marcar(G.personajes[a.quien] || a.quien === "vocero" ? a.quien : null);
    const tok = dlgToken;
    setTimeout(() => {
      if (tok !== dlgToken) return;
      temp.bloqueado = false;
      siguiente();
    }, 1100);
  }

  app.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.name === "nivel") S.postura(+el.value);
    else if (el.type === "radio" || el.type === "checkbox") S.click();
    if (el.name === "decision") {
      app.querySelector(".condiciones").classList.toggle("oculto", el.value !== "condicionar");
    }
    if (el.name === "cond") {
      const marcadas = app.querySelectorAll('input[name="cond"]:checked');
      if (marcadas.length > G.cierre.maxCondiciones) {
        el.checked = false;
        mostrarError(`Puedes elegir máximo ${G.cierre.maxCondiciones} condiciones.`);
      }
    }
  });

  function copiar() {
    const txt = textoResumen();
    const ok = () => mostrarError("Registro copiado ✓");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(ok, () => copiarViejo(txt, ok));
    } else copiarViejo(txt, ok);
  }
  function copiarViejo(txt, ok) {
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      ok();
    } catch (e) {
      mostrarError("No se pudo copiar; usa Descargar.");
    }
    ta.remove();
  }
  function descargar() {
    const blob = new Blob([textoResumen()], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    const dia = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(blob);
    a.download = `vocero_${(partida.codigo || "P").replace(/[^\w-]/g, "")}_${dia}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }
  function nueva() {
    if (partida.paso > 0 && !confirm("¿Empezar una nueva partida? Se borrará el registro actual de este dispositivo.")) return;
    localStorage.removeItem(CLAVE);
    dlgToken++; // detiene diálogos, registro y animaciones en curso
    partida = nuevaPartida();
    usarVersion(partida.version);
    temp = {};
    medidorPrevio = null;
    recuperada = false;
    render();
  }

  // ---------- Dibujo ----------
  // Ambiente y efectos al entrar a cada pantalla
  function sonidoDePantalla(paso) {
    S.callar();
    S.ambiente(["presenta", "responde", "revisa", "cierre"].includes(paso.tipo));
    const efecto = {
      config: () => S.transicion(),
      explicacion: () => S.notificacion(),
      presenta: () => {
        S.campana();
        if (app.querySelector(".badge")) setTimeout(() => S.alerta(), 1300);
      },
      cierre: () => S.mazo(),
      consecuencias: () => S.urna(),
      noViste: () => S.misterio(),
      resumen: () => S.exito(),
    }[paso.tipo];
    if (efecto) efecto();
  }

  function render(mismaPantalla) {
    const paso = PASOS[partida.paso];
    if (!mismaPantalla) entradaPaso = Date.now();
    const aviso = recuperada
      ? `<div class="aviso">Se recuperó una partida en curso (${esc(partida.codigo)}).
          <button class="btn texto" data-accion="cerrar-aviso">Continuar</button>
          <button class="btn texto" data-accion="descartar">Empezar de nuevo</button></div>`
      : "";
    const notaTxt = CONDUCTOR ? notaConductor(paso) : "";
    const nota = notaTxt ? `<aside class="conductor"><strong>Para quien conduce:</strong> ${esc(notaTxt)}</aside>` : "";
    app.innerHTML = `${encabezado(paso)}${aviso}<main class="carta ${mismaPantalla ? "sin-anim" : ""} p-${paso.tipo}" id="contenido">${pantallas[
      paso.tipo
    ](paso)}</main>${nota}`;
    // la aguja del medidor se desliza desde la postura anterior
    const aguja = app.querySelector(".aguja");
    if (aguja) {
      const destino = `${(+aguja.dataset.nivel - 0.5) * 20}%`;
      requestAnimationFrame(() => requestAnimationFrame(() => (aguja.style.left = destino)));
    }
    if (!mismaPantalla) {
      window.scrollTo(0, 0);
      const h = app.querySelector("h1, h2");
      if (h) h.focus({ preventScroll: true });
      if (dialogos[paso.tipo]) iniciarDialogo(dialogos[paso.tipo](paso));
      sonidoDePantalla(paso);
    }
  }

  function notaConductor(paso) {
    if (paso.i !== undefined) return paso.tipo === "revisa" ? G.momentos[paso.i].conductor : "";
    return (
      {
        portada: "Lee en voz alta la pregunta y el papel. Aclara que es voluntario, que no hay respuestas correctas y que puede pensar en voz alta.",
        config: "No sugieras un orden de prioridades. Anota si duda al ordenarlas.",
        explicacion: G.explicacion.conductor,
        cierre: G.cierre.conductor,
        noViste: "Observa la reacción de P1 al descubrir lo que no vio. Anota cuántas cartas abre y si dice que cambiaría su voto.",
        resumen: "Descarga el registro y haz la conversación final: ¿qué entendió, qué sintió y qué posición sostuvo o cambió, y por qué?",
      }[paso.tipo] || ""
    );
  }

  render();
})();
