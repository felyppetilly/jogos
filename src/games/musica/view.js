// Siga a Música — tela: xilofone colorido. O jogo toca, ela repete.
import { gsap } from 'gsap';
import { LEVELS, generateSequence, checkInput } from './logic.js';
import { playNote } from '../../core/audio.js';
import { onTap } from '../../core/ui.js';

const CORES = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4'];

export function mount(root, ctx) {
  const { voice, rng, shell, celebrate, testLog, wait } = ctx;
  const dif = ctx.difficulty('musica', 1, 5);
  let seq = [];
  let input = [];
  let modoLivre = false;
  let vitorias = 0;
  let rodadaN = 0;
  let vivo = true;
  let nTeclas = 0;
  let teclas = [];

  root.innerHTML = '';
  const palco = document.createElement('div');
  palco.className = 'musica';
  const xilofone = document.createElement('div');
  xilofone.className = 'xilofone';
  const btnLivre = document.createElement('button');
  btnLivre.className = 'botao-livre';
  btnLivre.dataset.testid = 'tocar-livre';
  btnLivre.setAttribute('aria-label', 'Tocar livre');
  btnLivre.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 46V14l28-6v32" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><ellipse cx="18" cy="46" rx="8" ry="6" fill="#c77dff" stroke="currentColor" stroke-width="4"/><ellipse cx="46" cy="40" rx="8" ry="6" fill="#c77dff" stroke="currentColor" stroke-width="4"/></svg>`;
  palco.append(xilofone, btnLivre);
  root.append(palco);

  function desenharTeclas(n) {
    nTeclas = n;
    xilofone.innerHTML = '';
    xilofone.style.setProperty('--n', n);
    teclas = Array.from({ length: n }, (_, i) => {
      const t = document.createElement('button');
      t.className = 'tecla';
      t.dataset.testid = `tecla-${i}`;
      t.style.setProperty('--cor', CORES[i]);
      t.style.setProperty('--altura', `${100 - i * 9}%`);
      t.innerHTML = '<i></i><i></i>';
      onTap(t, () => tocarTecla(i), shell);
      xilofone.append(t);
      return t;
    });
  }

  function acender(i, ms = 350) {
    const t = teclas[i];
    if (!t) return;
    t.classList.add('acesa');
    gsap.fromTo(t, { scale: 1 }, { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1 });
    setTimeout(() => t.classList.remove('acesa'), ms);
  }

  async function tocarSequencia(ms) {
    for (const i of seq) {
      if (!vivo) return;
      playNote(i, ms * 0.8);
      acender(i, ms * 0.8);
      await wait(ms);
    }
  }

  async function apresentar(ms = 600) {
    shell.setBusy(true);
    await wait(400);
    if (!vivo) return;
    await voice.say('musica.escuta');
    await tocarSequencia(ms);
    if (!vivo) return;
    await voice.say('musica.suavez');
    if (vivo && !modoLivre) shell.setBusy(false);
  }

  function novaRodada() {
    if (!vivo) return;
    dif.startRound();
    const cfg = LEVELS[dif.level];
    if (cfg.keys !== nTeclas) desenharTeclas(cfg.keys);
    seq = generateSequence(dif.level, rng);
    input = [];
    rodadaN++;
    testLog.rodada = { n: rodadaN, seq: [...seq] };
    return apresentar(600);
  }

  async function tocarTecla(i) {
    playNote(i, 450);
    acender(i);
    if (modoLivre) return;
    input.push(i);
    const r = checkInput(seq, input);
    if (r === 'continua') return;
    shell.setBusy(true);
    if (r === 'errada') {
      const t = teclas[i];
      t.classList.remove('balanca'); void t.offsetWidth; t.classList.add('balanca');
      const { showHint } = dif.recordWrong();
      input = [];
      await wait(500);
      await voice.say('musica.denovo');
      return apresentar(showHint ? 900 : 600);
    }
    dif.recordWin();
    vitorias++;
    await wait(300);
    await celebrate.small(xilofone);
    if (vitorias % 5 === 0) await celebrate.big();
    return novaRodada();
  }

  btnLivre.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    modoLivre = !modoLivre;
    btnLivre.classList.toggle('ativo', modoLivre);
    input = [];
    if (modoLivre) {
      shell.setBusy(false);
      voice.say('musica.livre', { interrupt: true });
    } else {
      voice.say('musica.desafio', { interrupt: true });
      apresentar(600);
    }
  });

  shell.onRepeat(() => {
    if (modoLivre) return voice.say('musica.livre', { interrupt: true });
    if (shell.isBusy()) return;
    input = [];
    apresentar(600);
  });

  novaRodada();
  return () => { vivo = false; };
}
