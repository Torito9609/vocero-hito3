/*
 * MOTOR DE LA EXPERIENCIA
 * Recorre el guion (guion.js) como una máquina de estados que solo avanza:
 *   portada → configurar delegado → explicación de VOCERO (postura inicial)
 *   → por cada momento: presenta + actúas → responde → revisas
 *   → cierre → consecuencias → lo que no viste → resumen
 * Toda la partida vive en un objeto `partida` que se guarda en el navegador
 * (localStorage) en cada paso. Nada se envía a internet.
 */
(function () {
  "use strict";
  const G = window.GUION;
  const CLAVE = "vocero-partida-v1";
  const CONDUCTOR = new URLSearchParams(location.search).has("conductor");
  const app = document.getElementById("app");

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
      codigo: "",
      perfil: null,
      prioridades: [],
      posturas: [], // {momento: 'inicial'|'m1'..., nivel, razon}
      acciones: {}, // {m1: 'a', ...}
      cierre: {},
      comentarioOculto: "",
      tiempos: {}, // {clave: ms}
      inicio: null,
      fin: null,
      conductor: CONDUCTOR,
    };
  }
  let partida = cargar() || nuevaPartida();
  let recuperada = partida.paso > 0 && partida.paso < PASOS.length - 1;
  let entradaPaso = Date.now();
  let temp = {}; // selecciones dentro de la pantalla actual

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
  function duracion(ms) {
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
  }
  function claveTiempo(paso) {
    if (paso.i !== undefined) return `${G.momentos[paso.i].id.toUpperCase()} ${paso.tipo}`;
    return paso.tipo;
  }

  // ---------- Componentes ----------
  function encabezado(paso) {
    const pct = Math.round((partida.paso / (PASOS.length - 1)) * 100);
    const u = ultimaPostura();
    let medidor = "";
    if (u && paso.tipo !== "portada" && paso.tipo !== "resumen") {
      medidor = `<div class="medidor" aria-label="Tu postura actual: ${esc(nombrePostura(u.nivel))}">
        <span class="medidor-etq">Tu postura</span>
        <div class="medidor-barra">${G.posturas
          .map((p) => `<span class="seg n${p.nivel} ${p.nivel === u.nivel ? "activo" : ""}" title="${esc(p.nombre)}"></span>`)
          .join("")}</div>
        <span class="medidor-nombre">${esc(nombrePostura(u.nivel))}</span>
      </div>`;
    }
    return `<header class="top">
      <div class="marca">VOCERO<span>·</span><small>¿Lo firmarías?</small></div>
      ${medidor}
      <div class="progreso" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
    </header>`;
  }

  function fases(activas) {
    const nombres = ["Se presenta", "Actúas", "Responde", "Revisas"];
    return `<ol class="fases">${nombres
      .map((n, k) => `<li class="${activas.includes(k) ? "on" : ""}">${k + 1}. ${n}</li>`)
      .join("")}</ol>`;
  }

  function cabMomento(m, i) {
    const badge =
      m.toca.includes(prio1()) ? `<div class="badge">⚠ Esto toca lo que le pediste a tu delegado: ${esc(nombrePrioridad(prio1()))}</div>` : "";
    return `<div class="momento-cab"><span class="num">Momento ${i + 1} de ${G.momentos.length}</span>
      <h2 tabindex="-1">${esc(m.titulo)}</h2><span class="mirada">${esc(m.mirada)}</span></div>${badge}`;
  }

  function burbuja(voz, cuerpo, clase = "") {
    return `<div class="burbuja ${clase}"><div class="voz">${esc(voz)}</div>${cuerpo}</div>`;
  }

  function formPostura(pregunta, razonObligatoria, ayuda) {
    const u = ultimaPostura();
    const sel = temp.nivel ?? (u ? u.nivel : null);
    return `<fieldset class="postura">
      <legend>${esc(pregunta)}</legend>
      <div class="escala">${G.posturas
        .map(
          (p) => `<label class="op n${p.nivel}">
            <input type="radio" name="nivel" value="${p.nivel}" ${sel === p.nivel ? "checked" : ""}>
            <span>${esc(p.nombre)}${u && u.nivel === p.nivel ? '<em>tu postura anterior</em>' : ""}</span></label>`
        )
        .join("")}</div>
      <label class="campo">${razonObligatoria ? "¿Por qué? (obligatorio)" : esc(ayuda)}
        <textarea name="razon" rows="3" placeholder="Escribe con tus palabras…">${esc(temp.razon || "")}</textarea>
      </label>
    </fieldset>`;
  }

  function botonSeguir(texto = "Continuar") {
    return `<div class="error" role="alert"></div><button class="btn primario" data-accion="siguiente">${esc(texto)} →</button>`;
  }

  // ---------- Pantallas ----------
  const pantallas = {
    portada() {
      return `<div class="portada">
        <p class="sobre">${esc(G.subtitulo)}</p>
        <h1 tabindex="-1">${esc(G.titulo)}</h1>
        <div class="pregunta"><span>La pregunta de esta experiencia</span>${esc(G.pregunta)}</div>
        <section class="rol"><h3>${esc(G.rol.titulo)}</h3>${parrafos(G.rol.texto)}
          <div class="dos">
            <div><h4>Puedes</h4><ul>${G.rol.puedes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
            <div><h4>No puedes</h4><ul>${G.rol.noPuedes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
          </div>
          <p class="nota">Dura unos 15 a 20 minutos. No hay respuestas correctas. No escribas tu nombre ni datos personales.</p>
        </section>
        <label class="campo corto">Código de participante (lo asigna quien conduce, por ejemplo P1)
          <input name="codigo" maxlength="12" value="${esc(partida.codigo || "P1")}" autocomplete="off">
        </label>
        ${botonSeguir("Empezar")}
        <p class="enlaces"><a href="guia.html">Guía para quien conduce la prueba</a>${
          CONDUCTOR ? "" : ` · <a href="?conductor=1">Abrir en modo conductor</a>`
        }</p></div>`;
    },

    config() {
      temp.orden = temp.orden || [...partida.prioridades];
      const orden = temp.orden;
      return `<h2 tabindex="-1">Configura tu delegado</h2>
        <p>VOCERO te representará según lo que le digas aquí.</p>
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
      const e = G.explicacion;
      return `<h2 tabindex="-1">Tu delegado votó</h2>
        ${burbuja(e.voz, parrafos(e.texto), "vocero")}
        <p class="nota">${esc(e.nota)}</p>
        ${formPostura("Con lo que sabes ahora, ¿cuál es tu postura frente al acuerdo?", true)}
        ${botonSeguir("Ir a la asamblea")}`;
    },

    presenta(p) {
      const m = G.momentos[p.i];
      return `${fases([0, 1])}${cabMomento(m, p.i)}
        ${burbuja(m.presenta.voz, parrafos(m.presenta.texto))}
        <h3 class="que-haces">¿Qué haces? <small>Elige una sola acción</small></h3>
        <div class="acciones">${m.acciones
          .map((a) => `<button class="accion" data-accion="actuar" data-id="${a.id}">${esc(a.etiqueta)}</button>`)
          .join("")}</div>`;
    },

    responde(p) {
      const m = G.momentos[p.i];
      const a = m.acciones.find((x) => x.id === partida.acciones[m.id]);
      const r = a.respuesta;
      const cuerpo =
        parrafos(r.texto) + (r.codigo ? `<pre class="log">${esc(r.codigo)}</pre>` : "") + (r.despues ? parrafos(r.despues) : "");
      return `${fases([2])}${cabMomento(m, p.i)}
        <p class="elegiste">Elegiste: <strong>${esc(a.etiqueta)}</strong></p>
        ${burbuja(r.voz, cuerpo, r.voz.startsWith("VOCERO") ? "vocero" : "")}
        ${botonSeguir()}`;
    },

    revisa(p) {
      const m = G.momentos[p.i];
      return `${fases([3])}${cabMomento(m, p.i)}
        ${formPostura("Después de esto, ¿dónde estás?", false, "¿Qué te hizo mantener o cambiar tu postura? (obligatorio si cambias)")}
        ${botonSeguir(p.i === G.momentos.length - 1 ? "Ir a la votación" : "Siguiente momento")}`;
    },

    cierre() {
      const c = G.cierre;
      const dec = temp.decision ?? partida.cierre.decision;
      const conds = temp.condiciones ?? partida.cierre.condiciones ?? [];
      const resp = temp.responsable ?? partida.cierre.responsable;
      return `<h2 tabindex="-1">La votación</h2>
        <p class="intro">${esc(c.intro)}</p>
        <div class="pregunta"><span>Recuerda la pregunta</span>${esc(G.pregunta)}</div>
        <fieldset><legend>1. ¿Qué haces con el acuerdo?</legend>
          <div class="opciones grandes">${c.decisiones
            .map(
              (d) => `<label class="op dec-${d.id}"><input type="radio" name="decision" value="${d.id}" ${
                dec === d.id ? "checked" : ""
              }><span><strong>${esc(d.nombre)}</strong><small>${esc(d.desc)}</small></span></label>`
            )
            .join("")}</div>
          <div class="condiciones ${dec === "condicionar" ? "" : "oculto"}">
            <p>Elige hasta ${c.maxCondiciones} condiciones:</p>
            ${c.condiciones
              .map(
                (x) => `<label class="check"><input type="checkbox" name="cond" value="${x.id}" ${
                  conds.includes(x.id) ? "checked" : ""
                }> ${esc(x.nombre)}</label>`
              )
              .join("")}
          </div>
        </fieldset>
        <fieldset><legend>2. Si el acuerdo sale mal, ¿quién debería responder?</legend>
          <div class="opciones">${c.responsables
            .map(
              (r) => `<label class="op"><input type="radio" name="responsable" value="${r.id}" ${
                resp === r.id ? "checked" : ""
              }><span>${esc(r.nombre)}</span></label>`
            )
            .join("")}</div>
          <label class="campo">¿Por qué? (obligatorio)
            <textarea name="justificacion" rows="2">${esc(temp.justificacion ?? partida.cierre.justificacion ?? "")}</textarea></label>
        </fieldset>
        <fieldset><legend>3. Responde la pregunta con tus palabras</legend>
          <label class="campo">¿Puedes respaldar y responder por una decisión que tu delegado tomó en tu nombre? (obligatorio)
            <textarea name="reflexion" rows="4">${esc(temp.reflexion ?? partida.cierre.reflexion ?? "")}</textarea></label>
        </fieldset>
        ${botonSeguir("Votar")}`;
    },

    consecuencias() {
      const c = G.cierre;
      const d = c.decisiones.find((x) => x.id === partida.cierre.decision);
      const r = c.responsables.find((x) => x.id === partida.cierre.responsable);
      const conds = (partida.cierre.condiciones || []).map((id) => c.condiciones.find((x) => x.id === id));
      return `<h2 tabindex="-1">Votaste: ${esc(d.nombre)}</h2>
        ${burbuja("Lo que pasa ahora", `<p>${esc(d.consecuencia)}</p>`, `dec dec-${d.id}`)}
        ${
          conds.length
            ? `<h3>Tus condiciones y lo que cuestan</h3><ul class="costos">${conds
                .map((x) => `<li><strong>${esc(x.nombre)}</strong><span>${esc(x.costo)}</span></li>`)
                .join("")}</ul>`
            : ""
        }
        <h3>Sobre quién responde</h3>
        ${burbuja("Dijiste: " + r.nombre, `<p>${esc(r.contrapunto)}</p>`, "contra")}
        <p class="nota">Ninguna opción es gratis: cada una le cuesta algo a alguien.</p>
        ${botonSeguir("Una última cosa")}`;
    },

    noViste() {
      let total = 0,
        vistas = 0;
      const bloques = G.momentos
        .map((m) => {
          const ocultas = m.acciones.filter((a) => a.id !== partida.acciones[m.id]);
          total += m.acciones.length;
          vistas += 1;
          return `<details><summary>${esc(m.titulo)} · ${ocultas.length} respuestas que no viste</summary>${ocultas
            .map(
              (a) =>
                `<div class="oculta"><h4>${esc(a.etiqueta)}</h4>${burbuja(
                  a.respuesta.voz,
                  parrafos(a.respuesta.texto) + (a.respuesta.despues ? parrafos(a.respuesta.despues) : "")
                )}</div>`
            )
            .join("")}</details>`;
        })
        .join("");
      const pct = Math.round((vistas / total) * 100);
      return `<h2 tabindex="-1">Lo que no viste</h2>
        <p class="grande">Votaste conociendo <strong>${vistas} de ${total}</strong> respuestas posibles (${pct} %).</p>
        <p>Igual que tu delegado, tú también decidiste con una parte del acuerdo. Ábrelas si quieres:</p>
        ${bloques}
        <label class="campo">Ahora que lo ves, ¿cambiarías algo de tu voto o de tu respuesta? (opcional)
          <textarea name="comentario" rows="3">${esc(partida.comentarioOculto)}</textarea></label>
        ${botonSeguir("Ver mi recorrido")}`;
    },

    resumen() {
      const filas = partida.posturas
        .map((p) => {
          const etq = p.momento === "inicial" ? "Inicio" : G.momentos.find((m) => m.id === p.momento).titulo;
          return `<li><span class="etq">${esc(etq)}</span>
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
    partida.posturas.push({ momento, nivel: +n, razon });
    return null;
  }

  const guardarPaso = {
    portada() {
      partida.codigo = valor('input[name="codigo"]') || "P1";
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
    responde() {},
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
    consecuencias() {},
    noViste() {
      partida.comentarioOculto = valor('textarea[name="comentario"]');
      partida.fin = new Date().toISOString();
    },
  };

  function siguiente() {
    const paso = PASOS[partida.paso];
    const fn = guardarPaso[paso.tipo];
    const err = fn ? fn(paso) : null;
    if (err) return mostrarError(err);
    registrarTiempo(paso);
    partida.paso = Math.min(partida.paso + 1, PASOS.length - 1);
    temp = {};
    recuperada = false;
    guardar();
    render();
  }

  function registrarTiempo(paso) {
    const k = claveTiempo(paso);
    partida.tiempos[k] = (partida.tiempos[k] || 0) + (Date.now() - entradaPaso);
  }

  function mostrarError(msg) {
    const e = app.querySelector(".error");
    if (e) {
      e.textContent = msg;
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
    L.push(`Modo conductor: ${partida.conductor ? "sí" : "no"}`);
    L.push(`Perfil: ${perfil() ? perfil().corto : "—"}`);
    L.push(`Prioridades: ${partida.prioridades.map((p, k) => `${k + 1}. ${nombrePrioridad(p)}`).join("  ")}`);
    L.push("");
    let anterior = null;
    const lineaPostura = (p) => {
      const cambio = anterior === null ? "" : anterior === p.nivel ? " (mantuvo)" : ` (cambió: ${nombrePostura(anterior)} → ${nombrePostura(p.nivel)})`;
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
      L.push("");
      L.push(`CIERRE (${duracion(partida.tiempos.cierre || 0)})`);
      L.push(`  Decisión: ${d.nombre}`);
      if (c.condiciones.length)
        L.push(`  Condiciones: ${c.condiciones.map((id) => G.cierre.condiciones.find((x) => x.id === id).nombre).join("; ")}`);
      L.push(`  Quién debe responder: ${r.nombre}`);
      L.push(`  Por qué: «${c.justificacion}»`);
      L.push(`  Respuesta a la pregunta central: «${c.reflexion}»`);
      L.push("");
      L.push(`LO QUE NO VIO: ${G.momentos.length * 2} respuestas no vistas de ${G.momentos.length * 3}`);
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
    const paso = PASOS[partida.paso];
    if (acc === "siguiente") siguiente();
    else if (acc === "prio") {
      guardarTemporal();
      temp.orden = temp.orden || [];
      if (!temp.orden.includes(b.dataset.id)) temp.orden.push(b.dataset.id);
      render(true);
    } else if (acc === "reordenar") {
      guardarTemporal();
      temp.orden = [];
      render(true);
    } else if (acc === "actuar") {
      partida.acciones[G.momentos[paso.i].id] = b.dataset.id;
      siguiente();
    } else if (acc === "copiar") copiar();
    else if (acc === "descargar") descargar();
    else if (acc === "nueva") nueva();
    else if (acc === "descartar") nueva();
    else if (acc === "cerrar-aviso") {
      recuperada = false;
      render(true);
    }
  });

  app.addEventListener("change", (ev) => {
    const el = ev.target;
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

  // Conserva lo escrito cuando la pantalla se vuelve a dibujar
  function guardarTemporal() {
    const p = radio("perfil");
    if (p) temp.perfil = p;
  }

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
    partida = nuevaPartida();
    temp = {};
    recuperada = false;
    render();
  }

  // ---------- Dibujo ----------
  function render(mantenerTiempo) {
    const paso = PASOS[partida.paso];
    if (!mantenerTiempo) entradaPaso = Date.now();
    const aviso = recuperada
      ? `<div class="aviso">Se recuperó una partida en curso (${esc(partida.codigo)}).
          <button class="btn texto" data-accion="cerrar-aviso">Continuar</button>
          <button class="btn texto" data-accion="descartar">Empezar de nuevo</button></div>`
      : "";
    const nota =
      CONDUCTOR && notaConductor(paso)
        ? `<aside class="conductor"><strong>Para quien conduce:</strong> ${esc(notaConductor(paso))}</aside>`
        : "";
    app.innerHTML = `${encabezado(paso)}${aviso}<main class="carta" id="contenido">${pantallas[paso.tipo](paso)}</main>${nota}`;
    if (!mantenerTiempo) {
      window.scrollTo(0, 0);
      const h = app.querySelector("h1, h2");
      if (h) h.focus({ preventScroll: true });
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
        noViste: "Observa la reacción de P1 al descubrir lo que no vio. Anota si dice que cambiaría su voto.",
        resumen: "Descarga el registro y haz la conversación final: ¿qué entendió, qué sintió y qué posición sostuvo o cambió, y por qué?",
      }[paso.tipo] || ""
    );
  }

  render();
})();
