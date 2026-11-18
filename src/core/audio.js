// Áudio: desbloqueio no iOS, notas do xilofone e efeitos sintetizados (sem arquivos).

let ctx = null;
let audioEl = null;

// Pentatônica de Dó: qualquer combinação soa bem.
export const NOTAS = [261.63, 293.66, 329.63, 392.0, 440.0];

export function getAudioContext() {
  if (!ctx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

export function getAudioElement() {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.setAttribute('playsinline', '');
  }
  return audioEl;
}

const SILENCIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

// Chamar dentro do primeiro toque da criança. O play() precisa acontecer na hora,
// sem nenhum await antes: o iOS só libera o áudio se ele vier do próprio toque.
export function unlockAudio({ el = getAudioElement(), ctx: c = getAudioContext() } = {}) {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch { /* navegador sem audioSession */ }
  try {
    el.src = SILENCIO;
    el.play()?.catch?.(() => {});
  } catch { /* ignora */ }
  try { c?.resume()?.catch?.(() => {}); } catch { /* ignora */ }
}

export function installVisibilityResume(doc = globalThis.document, ctxGetter = getAudioContext) {
  doc?.addEventListener('visibilitychange', () => {
    if (doc.visibilityState !== 'visible') return;
    const c = ctxGetter();
    if (c && (c.state === 'suspended' || c.state === 'interrupted')) c.resume?.();
  });
}

function tom(freq, ms, { tipo = 'triangle', volume = 0.35, quando = 0, desliza = null } = {}) {
  const c = getAudioContext();
  if (!c) return;
  const t0 = c.currentTime + quando;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t0);
  if (desliza) osc.frequency.exponentialRampToValueAtTime(desliza, t0 + ms / 1000);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + ms / 1000 + 0.05);
}

export function playNote(index, ms = 400) {
  const f = NOTAS[index];
  if (!f) return;
  tom(f, ms, { volume: 0.4 });
  tom(f * 2, ms * 0.6, { tipo: 'sine', volume: 0.08 });
}

export function playSfx(name) {
  switch (name) {
    case 'pop': tom(600, 120, { tipo: 'sine', desliza: 1100, volume: 0.3 }); break;
    case 'tada': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tom(f, 300, { quando: i * 0.09, volume: 0.25 })); break;
    case 'whoosh': tom(900, 350, { tipo: 'sawtooth', desliza: 200, volume: 0.06 }); break;
    case 'boing': tom(220, 250, { tipo: 'sine', desliza: 140, volume: 0.25 }); break;
    default: break;
  }
}

export function playMelody(notes) {
  const c = getAudioContext();
  let t = 0;
  for (const [f, ms] of notes) {
    if (c && f) tom(f, ms * 0.95, { quando: t / 1000, volume: 0.3 });
    t += ms;
  }
  return new Promise((r) => setTimeout(r, t));
}
