// Continhas no Bolo — tela: coberturas caem no bolo, ela conta e escolhe o número.
// Cada acerto acende uma vela; com 5 velas ela assopra e toca "Parabéns".
import { gsap } from 'gsap';
import { generateRound, layoutPositions } from './logic.js';
import { INCENTIVOS } from '../../core/phrases.js';
import { emoji, onTap } from '../../core/ui.js';
import { playSfx, playMelody } from '../../core/audio.js';

const VELAS_PARA_FESTA = 5;
const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const PARABENS = [
  [N.G4, 300], [N.G4, 150], [N.A4, 450], [N.G4, 450], [N.C5, 450], [N.B4, 900],
  [N.G4, 300], [N.G4, 150], [N.A4, 450], [N.G4, 450], [N.D5, 450], [N.C5, 900],
  [N.G4, 300], [N.G4, 150], [N.G5, 450], [N.E5, 450], [N.C5, 450], [N.B4, 450], [N.A4, 900],
  [N.F5, 300], [N.F5, 150], [N.E5, 450], [N.C5, 450], [N.D5, 450], [N.C5, 900],
];
const SABORES = [
  { massa: '#f7a1c4', massa2: '#f48fb1', creme: '#fffaf0' },
  { massa: '#c89b7b', massa2: '#a9785a', creme: '#ffe9f2' },
  { massa: '#ffe082', massa2: '#ffd54f', creme: '#ffffff' },
];

function boloSVG(s) {
  return `<svg class="bolo" viewBox="0 0 300 170" aria-hidden="true">
    <ellipse cx="150" cy="158" rx="145" ry="11" fill="#e0e0e0" stroke="#4a2c1a" stroke-width="4"/>
    <rect x="22" y="88" width="256" height="68" rx="14" fill="${s.massa2}" stroke="#4a2c1a" stroke-width="4"/>
    <path d="M22 100 Q22 88 34 88 H266 Q278 88 278 100 V108 Q268 120 258 108 Q246 124 234 108 Q220 120 206 108 Q192 126 178 108 Q164 120 150 108 Q136 124 122 108 Q108 120 94 108 Q80 126 66 108 Q52 120 40 108 Q30 120 22 108 Z" fill="${s.creme}" stroke="#4a2c1a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="52" y="22" width="196" height="70" rx="14" fill="${s.massa}" stroke="#4a2c1a" stroke-width="4"/>
    <path d="M52 34 Q52 22 64 22 H236 Q248 22 248 34 V42 Q238 54 226 42 Q212 58 198 42 Q184 54 170 42 Q156 60 142 42 Q128 54 114 42 Q100 58 86 42 Q72 54 62 42 Q56 50 52 42 Z" fill="${s.creme}" stroke="#4a2c1a" stroke-width="4" stroke-linejoin="round"/>
  </svg>`;
}

const VELA_SVG = `<svg viewBox="0 0 30 70" aria-hidden="true">
  <path class="chama" d="M15 4 C22 14 22 22 15 26 C8 22 8 14 15 4 Z" fill="#ffb703" stroke="#fb8500" stroke-width="2"/>
  <rect x="9" y="28" width="12" height="40" rx="4" fill="#8ecae6" stroke="#4a2c1a" stroke-width="3"/>
  <path d="M9 38 L21 34 M9 50 L21 46 M9 62 L21 58" stroke="#fff" stroke-width="3"/>
</svg>`;

function alvoPx() {
  return Math.max(60, Math.min(80, 0.16 * Math.min(innerWidth, innerHeight)));
}

export function mount(root, ctx) {
  const { voice, rng, shell, celebrate, testLog, wait } = ctx;
  const dif = ctx.difficulty('bolo', 1, 4);
  let vivo = true;
  let rodada = null;
  let rodadaN = 0;
  let contados = new Set();
  let esperandoSopro = false;
  let sabor = 0;

  root.innerHTML = '';
  const tela = document.createElement('div');
  tela.className = 'bolo-tela';
  const cena = document.createElement('div');
  cena.className = 'cena';
  const velas = document.createElement('button');
  velas.className = 'velas';
  velas.dataset.testid = 'velas';
  velas.setAttribute('aria-label', 'Velas');
  const topo = document.createElement('div');
  topo.className = 'topo';
  const boloWrap = document.createElement('div');
  boloWrap.className = 'bolo-wrap';
  boloWrap.innerHTML = boloSVG(SABORES[sabor]);
  cena.append(velas, topo, boloWrap);
  const numeros = document.createElement('div');
  numeros.className = 'numeros';
  tela.append(cena, numeros);
  root.append(tela);

  const coberturas = () => [...topo.querySelectorAll('.cobertura')];

  function posicionar(els, animar = false) {
    const box = { w: topo.clientWidth, h: topo.clientHeight };
    const pos = layoutPositions(els.length, box, alvoPx());
    els.forEach((el, i) => {
      const p = pos[i];
      const css = { left: p.x - p.tam / 2, top: p.y - p.tam / 2, width: p.tam, height: p.tam };
      if (animar) gsap.to(el, { ...css, duration: 0.35, ease: 'power2.out' });
      else gsap.set(el, css);
    });
  }

  function criarCobertura() {
    const b = document.createElement('button');
    b.className = 'cobertura';
    b.dataset.testid = 'cobertura';
    b.append(emoji(rodada.cobertura.emoji));
    onTap(b, () => contar(b), shell);
    topo.append(b);
    return b;
  }

  function contar(b) {
    if (esperandoSopro) return;
    if (!contados.has(b)) {
      contados.add(b);
      const selo = document.createElement('span');
      selo.className = 'selo';
      selo.textContent = String(contados.size);
      b.append(selo);
    }
    const k = Number(b.querySelector('.selo').textContent);
    voice.say(`num.${k}`, { interrupt: true });
    gsap.fromTo(b, { y: 0 }, { y: -14, duration: 0.15, yoyo: true, repeat: 1 });
  }

  function limparContagem() {
    contados = new Set();
    topo.querySelectorAll('.selo').forEach((s) => s.remove());
  }

  async function novaRodada() {
    if (!vivo) return;
    shell.setBusy(true);
    dif.startRound();
    rodada = generateRound(dif.level, rng);
    rodadaN++;
    testLog.rodada = { n: rodadaN, tipo: rodada.tipo, cobertura: rodada.cobertura.id, a: rodada.a, b: rodada.b, resposta: rodada.resposta, opcoes: [...rodada.opcoes] };
    limparContagem();
    topo.innerHTML = '';
    numeros.innerHTML = '';

    const total = rodada.tipo === 'somar' ? rodada.a + rodada.b : rodada.a;
    const els = Array.from({ length: total }, criarCobertura);
    posicionar(els);
    const iniciais = els.slice(0, rodada.a);
    const novas = els.slice(rodada.a);
    novas.forEach((el) => { el.style.visibility = 'hidden'; });
    gsap.from(iniciais, { scale: 0, duration: 0.3, stagger: 0.06, ease: 'back.out(2)' });
    await wait(500);
    if (!vivo) return;
    await voice.say(rodada.falas[0]);

    if (rodada.tipo === 'somar') {
      novas.forEach((el) => { el.style.visibility = ''; });
      await new Promise((r) => gsap.from(novas, { y: -innerHeight, duration: 0.9, stagger: 0.25, ease: 'bounce.out', onComplete: r }));
      playSfx('boing');
      if (!vivo) return;
      await voice.say(rodada.falas[1]);
    } else if (rodada.tipo === 'tirar') {
      await passarinhoCome(els.slice(rodada.a - rodada.b));
      if (!vivo) return;
      posicionar(coberturas(), true);
      await voice.say(rodada.falas[1]);
    }

    rodada.opcoes.forEach((n) => {
      const b = document.createElement('button');
      b.className = 'numero';
      b.dataset.testid = `numero-${n}`;
      b.textContent = String(n);
      onTap(b, () => escolher(n, b), shell);
      numeros.append(b);
    });
    gsap.from(numeros.children, { scale: 0, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' });
    if (vivo) shell.setBusy(false);
  }

  async function passarinhoCome(comidas) {
    const ave = emoji('1F426', 'passarinho');
    cena.append(ave);
    const alvo = comidas[0].getBoundingClientRect();
    const base = cena.getBoundingClientRect();
    const x = alvo.left - base.left;
    const y = alvo.top - base.top - 40;
    playSfx('whoosh');
    await new Promise((r) => gsap.timeline({ onComplete: r })
      .fromTo(ave, { x: -150, y: y - 80 }, { x, y, duration: 0.8, ease: 'power2.out' })
      .to(comidas, { y: -60, scale: 0, duration: 0.4, stagger: 0.12 })
      .to(ave, { x: base.width + 150, y: y - 120, duration: 0.8, ease: 'power2.in' }));
    comidas.forEach((c) => c.remove());
    ave.remove();
  }

  async function escolher(n, botao) {
    if (esperandoSopro) return;
    voice.say(`num.${n}`, { interrupt: true });
    if (n === rodada.resposta) {
      shell.setBusy(true);
      dif.recordWin();
      acenderVela();
      await celebrate.small(botao);
      if (velas.children.length >= VELAS_PARA_FESTA) return prepararFesta();
      return novaRodada();
    }
    botao.classList.remove('balanca'); void botao.offsetWidth; botao.classList.add('balanca');
    const { showHint } = dif.recordWrong();
    if (!showHint) return voice.say(rng.pick(INCENTIVOS));
    shell.setBusy(true);
    await voice.say('bolo.vamoscontar');
    limparContagem();
    for (const c of coberturas()) {
      if (!vivo) return;
      contados.add(c);
      const selo = document.createElement('span');
      selo.className = 'selo';
      selo.textContent = String(contados.size);
      c.append(selo);
      gsap.fromTo(c, { y: 0 }, { y: -14, duration: 0.15, yoyo: true, repeat: 1 });
      await voice.say(`num.${contados.size}`);
      await wait(250);
    }
    if (vivo) shell.setBusy(false);
  }

  function acenderVela() {
    const v = document.createElement('span');
    v.className = 'vela';
    v.innerHTML = VELA_SVG;
    velas.append(v);
    gsap.from(v, { y: -40, scale: 0, duration: 0.4, ease: 'back.out(2)' });
  }

  async function prepararFesta() {
    await voice.say('bolo.pronto');
    esperandoSopro = true;
    velas.classList.add('pronta');
    shell.setBusy(false);
  }

  velas.addEventListener('pointerdown', async (e) => {
    e.preventDefault();
    if (!esperandoSopro) return;
    esperandoSopro = false;
    velas.classList.remove('pronta');
    shell.setBusy(true);
    playSfx('whoosh');
    gsap.to(velas.querySelectorAll('.chama'), { scale: 0, opacity: 0, transformOrigin: '50% 100%', duration: 0.3, stagger: 0.05 });
    const duracao = PARABENS.reduce((t, [, ms]) => t + ms, 0);
    playMelody(PARABENS);
    voice.say('bolo.parabens');
    await wait(duracao);
    await celebrate.big();
    if (!vivo) return;
    velas.innerHTML = '';
    sabor = (sabor + 1) % SABORES.length;
    boloWrap.innerHTML = boloSVG(SABORES[sabor]);
    novaRodada();
  });

  let timer = null;
  const aoRedimensionar = () => {
    clearTimeout(timer);
    timer = setTimeout(() => posicionar(coberturas()), 80);
  };
  addEventListener('resize', aoRedimensionar);

  novaRodada();
  return () => { vivo = false; removeEventListener('resize', aoRedimensionar); };
}
