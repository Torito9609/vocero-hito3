/*
 * SONIDOS — generados en el navegador con Web Audio (no hay archivos de audio).
 * VOCERO: pitidos robóticos al hablar, zumbido al pensar, chisporroteo de datos.
 * Efectos: mano, murmullo, urna, cartas. Se silencia con el botón 🔊 del encabezado.
 */
window.SONIDO = (function () {
  "use strict";
  const CLAVE = "vocero-sonido";
  let ctx = null;
  let master = null;
  let activo = localStorage.getItem(CLAVE) !== "off";

  function iniciar() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    return true;
  }
  // Los navegadores solo permiten audio después de un gesto del usuario
  ["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, iniciar, { passive: true }));

  const listo = () => activo && ctx && ctx.state === "running";
  const ahora = () => ctx.currentTime;
  const azar = (a, b) => a + Math.random() * (b - a);

  // Un tono con envolvente
  function tono({ f = 440, f2 = null, tipo = "sine", t = 0, dur = 0.1, vol = 0.5, ataque = 0.005 }) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t0 = ahora() + t;
    o.type = tipo;
    o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  // Ruido filtrado (papel, murmullos, aire)
  function ruido({ t = 0, dur = 0.3, vol = 0.3, filtro = "bandpass", f = 800, f2 = null, q = 1 }) {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = filtro;
    fl.Q.value = q;
    const t0 = ahora() + t;
    fl.frequency.setValueAtTime(f, t0);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(fl).connect(g).connect(master);
    src.start(t0);
  }

  return {
    get activo() {
      return activo;
    },
    alternar() {
      activo = !activo;
      localStorage.setItem(CLAVE, activo ? "on" : "off");
      if (activo && iniciar()) this.aprende();
      return activo;
    },

    // VOCERO habla: ráfaga de pitidos robóticos (más larga si la frase es larga)
    vocero(texto = "") {
      if (!listo()) return;
      const n = Math.max(3, Math.min(8, Math.round(texto.length / 22)));
      let t = 0;
      for (let i = 0; i < n; i++) {
        const f = azar(520, 1500);
        const dur = azar(0.04, 0.09);
        tono({ f, f2: f * azar(0.8, 1.35), tipo: i % 2 ? "square" : "triangle", t, dur, vol: 0.18 });
        t += dur + azar(0.015, 0.05);
      }
    },
    // VOCERO piensa: zumbido grave con trémolo
    piensa() {
      if (!listo()) return;
      tono({ f: 140, f2: 190, tipo: "sawtooth", dur: 0.35, vol: 0.06, ataque: 0.05 });
      tono({ f: 880, tipo: "sine", t: 0.05, dur: 0.05, vol: 0.08 });
      tono({ f: 1175, tipo: "sine", t: 0.14, dur: 0.05, vol: 0.08 });
    },
    // VOCERO aprende una prioridad: arpegio ascendente
    aprende() {
      if (!listo()) return;
      [523, 659, 784, 1047].forEach((f, k) => tono({ f, tipo: "triangle", t: k * 0.07, dur: 0.12, vol: 0.2 }));
    },
    // Registro de negociación corriendo: chisporroteo de datos
    datos() {
      if (!listo()) return;
      for (let i = 0; i < 3; i++) tono({ f: azar(1800, 4200), tipo: "square", t: i * 0.008, dur: 0.012, vol: 0.05 });
    },
    finDatos() {
      if (!listo()) return;
      tono({ f: 1320, tipo: "sine", dur: 0.08, vol: 0.2 });
      tono({ f: 990, tipo: "sine", t: 0.09, dur: 0.14, vol: 0.2 });
    },
    // Efectos de la sala
    mano() {
      if (!listo()) return;
      ruido({ dur: 0.18, vol: 0.12, filtro: "highpass", f: 1500, f2: 4000 });
      tono({ f: 330, f2: 660, tipo: "sine", t: 0.05, dur: 0.15, vol: 0.18 });
    },
    murmullo() {
      if (!listo()) return;
      ruido({ dur: 1.1, vol: 0.22, filtro: "bandpass", f: 450, f2: 650, q: 2.5 });
      ruido({ t: 0.25, dur: 0.9, vol: 0.15, filtro: "bandpass", f: 300, f2: 380, q: 3 });
    },
    urna() {
      if (!listo()) return;
      ruido({ t: 0.25, dur: 0.6, vol: 0.18, filtro: "highpass", f: 2500, f2: 900 });
      tono({ f: 130, f2: 55, tipo: "sine", t: 1.2, dur: 0.25, vol: 0.5 });
      tono({ f: 988, tipo: "sine", t: 1.55, dur: 0.12, vol: 0.18 });
      tono({ f: 1319, tipo: "sine", t: 1.66, dur: 0.3, vol: 0.18 });
    },
    carta() {
      if (!listo()) return;
      ruido({ dur: 0.14, vol: 0.2, filtro: "highpass", f: 3000, f2: 1200 });
    },
  };
})();
