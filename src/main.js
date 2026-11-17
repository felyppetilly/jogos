import { gsap } from 'gsap';
import { isTestMode, getSeed, testLog } from './core/test-mode.js';
import { createRng } from './core/random.js';
import { createVoice, createAudioPlayer, createTestPlayer } from './core/voice.js';
import { unlockAudio, getAudioElement, installVisibilityResume } from './core/audio.js';
import { createDifficulty } from './core/difficulty.js';
import { createCelebrate } from './core/celebrate.js';
import { createShell } from './core/shell.js';
import { BASE } from './core/ui.js';
import { parseRoute, navigate } from './router.js';
import { mountStart } from './screens/start.js';
import { mountMenu } from './screens/menu.js';
import * as placeholder from './games/placeholder.js';

const JOGOS = { musica: placeholder, letras: placeholder, bolo: placeholder };

const teste = isTestMode();
if (teste) {
  window.__jogos = testLog;
  gsap.globalTimeline.timeScale(50);
}

const app = document.getElementById('app');
const rng = createRng(getSeed());
let voice = null;
let iniciado = false;
let desmontar = null;

async function carregarManifesto() {
  try {
    const r = await fetch(`${BASE}audio/manifesto.json`);
    if (r.ok) return await r.json();
  } catch { /* offline sem cache: usa a voz do navegador */ }
  return { voz: [], gravado: [] };
}

function render() {
  desmontar?.();
  desmontar = null;
  app.className = '';
  if (!iniciado) {
    mountStart(app, { onStart: iniciar });
    return;
  }
  const rota = parseRoute(location.hash);
  if (rota === 'menu') {
    mountMenu(app, { voice, onOpen: (jogo) => navigate(jogo) });
    return;
  }
  const shell = createShell(app, { voice, onHome: () => navigate('menu') });
  const ctx = {
    voice,
    rng,
    shell,
    testLog,
    celebrate: createCelebrate({ voice, rng }),
    difficulty: (gameId, minLevel, maxLevel) => createDifficulty({ gameId, minLevel, maxLevel }),
  };
  desmontar = JOGOS[rota].mount(shell.el, ctx);
}

async function iniciar() {
  if (!teste) unlockAudio();
  iniciado = true;
  voice.say('inicio.oi');
  render();
}

async function boot() {
  const manifest = await carregarManifesto();
  const player = teste ? createTestPlayer(testLog.vozLog) : createAudioPlayer(getAudioElement());
  voice = createVoice({ manifest, base: BASE, player });
  installVisibilityResume();
  addEventListener('hashchange', render);
  render();
}

boot();
