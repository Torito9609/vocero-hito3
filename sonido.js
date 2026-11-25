/*
 * SONIDOS Y VOZ DE VOCERO
 * - Efectos generados en el navegador con Web Audio (no hay archivos de audio).
 * - VOCERO habla con la voz sintética del navegador (Web Speech), en español,
 *   con tono grave y robótico, precedida de pitidos. Si el dispositivo no tiene
 *   voz en español, VOCERO solo hace los pitidos.
 * - Todo se silencia con el botón 🔊 del encabezado.
 */
window.SONIDO = (function () {
  "use strict";
  const CLAVE = "vocero-sonido";
  let ctx = null;
  let master = null;
  let activo = localStorage.getItem(CLAVE) !== "off";

  // ---------- Motor de audio ----------
  function iniciar() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    // compresor: permite volumen alto sin distorsión
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);
    return true;
  }
  // Los navegadores solo permiten audio después de un gesto del usuario
  ["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, iniciar, { passive: true }));

  const listo = () => activo && ctx && ctx.state === "running";
  const ahora = () => ctx.currentTime;
  const azar = (a, b) => a + Math.random() * (b - a);

  function tono({ f = 440, f2 = null, tipo = "sine", t = 0, dur = 0.1, vol = 0.5, ataque = 0.005, destino = null }) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t0 = ahora() + t;
    o.type = tipo;
    o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(destino || master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  let bufRuido = null;
  function ruidoBuffer() {
    if (bufRuido) return bufRuido;
    const n = ctx.sampleRate * 2;
    bufRuido = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = bufRuido.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return bufRuido;
  }
  function ruido({ t = 0, dur = 0.3, vol = 0.4, filtro = "bandpass", f = 800, f2 = null, q = 1, ataque = 0.25 }) {
    const src = ctx.createBufferSource();
    src.buffer = ruidoBuffer();
    const fl = ctx.createBiquadFilter();
    fl.type = filtro;
    fl.Q.value = q;
    const t0 = ahora() + t;
    fl.frequency.setValueAtTime(f, t0);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + Math.max(0.004, dur * ataque));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(fl).connect(g).connect(master);
    src.start(t0, Math.random());
    src.stop(t0 + dur + 0.05);
  }

  // Golpe de madera (mazo, urna)
  function golpe(t = 0, f = 180, vol = 0.9) {
    tono({ f, f2: f * 0.45, tipo: "sine", t, dur: 0.18, vol, ataque: 0.002 });
    ruido({ t, dur: 0.07, vol: vol * 0.7, filtro: "bandpass", f: 1200, q: 1.5, ataque: 0.05 });
  }

  // "Ooh" del público: vocal aproximada con dos formantes
  function vocal(t, f0, dur, vol) {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    const t0 = ahora() + t;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.linearRampToValueAtTime(f0 * azar(0.8, 1.25), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    [500, 900].forEach((ff) => {
      const b = ctx.createBiquadFilter();
      b.type = "bandpass";
      b.frequency.value = ff * azar(0.9, 1.1);
      b.Q.value = 6;
      o.connect(b).connect(g);
    });
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  // ---------- Ambiente de la sala (murmullo de fondo continuo) ----------
  let amb = null;
  function ambiente(encendido) {
    if (!encendido || !listo()) {
      if (amb) {
        const a = amb;
        amb = null;
        clearInterval(a.iv);
        a.g.gain.setTargetAtTime(0.0001, ahora(), 0.4);
        setTimeout(() => a.src.stop(), 1500);
      }
      return;
    }
    if (amb) return;
    const src = ctx.createBufferSource();
    src.buffer = ruidoBuffer();
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 420;
    bp.Q.value = 0.8;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.setTargetAtTime(0.07, ahora(), 0.8);
    // el murmullo sube y baja lentamente
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.17;
    const lg = ctx.createGain();
    lg.gain.value = 0.025;
    lfo.connect(lg).connect(g.gain);
    src.connect(bp).connect(lp).connect(g).connect(master);
    src.start();
    lfo.start();
    // de vez en cuando: una silla, una tos, un papel
    const iv = setInterval(() => {
      if (!listo() || Math.random() < 0.45) return;
      const r = Math.random();
      if (r < 0.35) ruido({ dur: 0.35, vol: 0.12, filtro: "bandpass", f: 260, f2: 180, q: 4 }); // silla
      else if (r < 0.6) ruido({ dur: 0.18, vol: 0.14, filtro: "bandpass", f: 900, q: 2, ataque: 0.1 }); // tos
      else if (r < 0.85) ruido({ dur: 0.25, vol: 0.08, filtro: "highpass", f: 3500 }); // papel
      else vocal(0, azar(110, 200), 0.6, 0.05); // alguien comenta
    }, 2200);
    amb = { src, g, iv, lfo };
  }

  // ---------- Voz de VOCERO ----------
  const voz = window.speechSynthesis || null;
  let vozElegida = null;
  function elegirVoz() {
    if (!voz) return null;
    const vs = voz.getVoices().filter((v) => /^es([-_]|$)/i.test(v.lang));
    const pref = ["es-CO", "es-419", "es-MX", "es-US", "es-ES"];
    vozElegida =
      pref.map((l) => vs.find((v) => v.lang.replace("_", "-").toLowerCase() === l.toLowerCase())).find(Boolean) || vs[0] || null;
    return vozElegida;
  }
  if (voz) {
    elegirVoz();
    voz.addEventListener && voz.addEventListener("voiceschanged", elegirVoz);
  }
  function hablar(texto, alTerminar) {
    if (!activo || !voz || !(vozElegida || elegirVoz())) return alTerminar && alTerminar();
    voz.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/[«»]/g, ""));
    u.voice = vozElegida;
    u.lang = vozElegida.lang;
    u.pitch = 0.45; // grave, robótica
    u.rate = 1.05;
    u.volume = 1;
    u.onend = u.onerror = () => alTerminar && alTerminar();
    voz.speak(u);
  }

  // ---------- API ----------
  return {
    get activo() {
      return activo;
    },
    get tieneVoz() {
      return !!(voz && (vozElegida || elegirVoz()));
    },
    alternar() {
      activo = !activo;
      localStorage.setItem(CLAVE, activo ? "on" : "off");
      if (!activo) {
        this.callar();
        ambiente(false);
      } else if (iniciar()) this.aprende();
      return activo;
    },
    callar() {
      if (voz) voz.cancel();
    },
    ambiente,

    // VOCERO: pitidos y luego su voz
    vocero(texto = "", alTerminar) {
      if (listo()) {
        let t = 0;
        for (let i = 0; i < 4; i++) {
          const f = azar(700, 1600);
          const dur = azar(0.04, 0.07);
          tono({ f, f2: f * azar(0.8, 1.35), tipo: i % 2 ? "square" : "triangle", t, dur, vol: 0.32 });
          t += dur + 0.025;
        }
        setTimeout(() => hablar(texto, alTerminar), 260);
      } else if (alTerminar) alTerminar();
    },
    piensa() {
      if (!listo()) return;
      tono({ f: 140, f2: 210, tipo: "sawtooth", dur: 0.4, vol: 0.14, ataque: 0.05 });
      [880, 1175, 990].forEach((f, k) => tono({ f, tipo: "sine", t: 0.06 + k * 0.09, dur: 0.06, vol: 0.22 }));
    },
    aprende() {
      if (!listo()) return;
      [523, 659, 784, 1047, 1319].forEach((f, k) => tono({ f, tipo: "triangle", t: k * 0.065, dur: 0.16, vol: 0.4 }));
    },
    notificacion() {
      if (!listo()) return;
      tono({ f: 1318, tipo: "sine", dur: 0.18, vol: 0.45 });
      tono({ f: 1760, tipo: "sine", t: 0.14, dur: 0.3, vol: 0.4 });
    },
    datos() {
      if (!listo()) return;
      for (let i = 0; i < 4; i++) tono({ f: azar(1500, 4200), tipo: "square", t: i * 0.007, dur: 0.012, vol: 0.12 });
    },
    finDatos() {
      if (!listo()) return;
      tono({ f: 1320, tipo: "square", dur: 0.08, vol: 0.3 });
      tono({ f: 880, tipo: "square", t: 0.1, dur: 0.18, vol: 0.3 });
    },

    // Interfaz
    click() {
      if (!listo()) return;
      tono({ f: 1800, f2: 1200, tipo: "sine", dur: 0.04, vol: 0.25, ataque: 0.002 });
    },
    postura(n) {
      if (!listo()) return;
      const f = [660, 587, 523, 440, 349][n - 1] || 523;
      tono({ f, tipo: "triangle", dur: 0.18, vol: 0.4 });
      tono({ f: f * 1.5, tipo: "sine", t: 0.05, dur: 0.15, vol: 0.18 });
    },
    error() {
      if (!listo()) return;
      tono({ f: 196, tipo: "square", dur: 0.12, vol: 0.25 });
      tono({ f: 165, tipo: "square", t: 0.13, dur: 0.18, vol: 0.25 });
    },
    transicion() {
      if (!listo()) return;
      ruido({ dur: 0.45, vol: 0.22, filtro: "bandpass", f: 400, f2: 2400, q: 1.2, ataque: 0.6 });
    },

    // Diálogos (sin voz): aparece un mensaje / envías tu pregunta
    mensaje(k = 0) {
      if (!listo()) return;
      const f = 520 + (k % 6) * 70;
      tono({ f, f2: f * 1.25, tipo: "sine", dur: 0.08, vol: 0.3 });
    },
    envio() {
      if (!listo()) return;
      ruido({ dur: 0.22, vol: 0.25, filtro: "highpass", f: 1200, f2: 4500 });
      tono({ f: 700, f2: 1100, tipo: "sine", dur: 0.12, vol: 0.25 });
    },

    // La sala
    campana() {
      // campanilla de la moderadora al abrir un momento
      if (!listo()) return;
      [0, 0.32].forEach((t) => {
        tono({ f: 1568, tipo: "sine", t, dur: 1.2, vol: 0.4, ataque: 0.002 });
        tono({ f: 3920, tipo: "sine", t, dur: 0.6, vol: 0.12, ataque: 0.002 });
      });
    },
    alerta() {
      if (!listo()) return;
      tono({ f: 880, tipo: "triangle", dur: 0.14, vol: 0.4 });
      tono({ f: 660, tipo: "triangle", t: 0.16, dur: 0.22, vol: 0.4 });
    },
    mano() {
      if (!listo()) return;
      ruido({ dur: 0.2, vol: 0.3, filtro: "highpass", f: 1500, f2: 4000 });
      tono({ f: 330, f2: 700, tipo: "sine", t: 0.05, dur: 0.18, vol: 0.4 });
    },
    murmullo() {
      if (!listo()) return;
      ruido({ dur: 1.4, vol: 0.4, filtro: "bandpass", f: 420, f2: 700, q: 2 });
      for (let i = 0; i < 5; i++) vocal(i * 0.12, azar(120, 260), azar(0.5, 0.9), 0.12);
    },
    mazo() {
      if (!listo()) return;
      golpe(0, 170, 0.9);
      golpe(0.28, 160, 0.8);
    },
    urna() {
      if (!listo()) return;
      ruido({ t: 0.2, dur: 0.7, vol: 0.35, filtro: "highpass", f: 2500, f2: 800 });
      golpe(1.25, 120, 0.9);
      tono({ f: 988, tipo: "sine", t: 1.55, dur: 0.18, vol: 0.4 });
      tono({ f: 1319, tipo: "sine", t: 1.7, dur: 0.45, vol: 0.4 });
    },
    carta() {
      if (!listo()) return;
      ruido({ dur: 0.16, vol: 0.4, filtro: "highpass", f: 3000, f2: 1200 });
      tono({ f: 500, f2: 900, tipo: "sine", t: 0.05, dur: 0.1, vol: 0.2 });
    },
    misterio() {
      if (!listo()) return;
      [220, 261.6, 311.1].forEach((f, k) => tono({ f, tipo: "triangle", t: k * 0.18, dur: 1.4, vol: 0.18, ataque: 0.2 }));
    },
    exito() {
      if (!listo()) return;
      [523, 659, 784, 1047].forEach((f, k) => tono({ f, tipo: "triangle", t: k * 0.11, dur: 0.5, vol: 0.32 }));
    },
  };
})();
