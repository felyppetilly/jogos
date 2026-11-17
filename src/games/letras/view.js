// Letra Inicial com Dinossauros — tela: ninho com 3 ovos; o ovo certo choca um filhote.
import { gsap } from 'gsap';
import { generateRound } from './logic.js';
import { INCENTIVOS } from '../../core/phrases.js';
import { emoji, onTap } from '../../core/ui.js';
import { playSfx } from '../../core/audio.js';

const MAX_FILHOTES = 8;
const CORES_OVO = ['#fff3c4', '#d7f5e6', '#ffe0ec', '#dcecff'];

function ovoSVG(cor) {
  return `<svg viewBox="0 0 100 130" aria-hidden="true">
    <path class="ovo-baixo" d="M9 100 L22 90 L36 102 L50 88 L64 102 L78 90 L91 100 C88 116 72 126 50 126 C28 126 12 116 9 100 Z" fill="${cor}" stroke="#4a2c1a" stroke-width="4" stroke-linejoin="round"/>
    <path class="ovo-cima" d="M9 100 C4 46 26 4 50 4 C74 4 96 46 91 100 L78 90 L64 102 L50 88 L36 102 L22 90 Z" fill="${cor}" stroke="#4a2c1a" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="30" cy="40" r="5" fill="#4a2c1a" opacity="0.12"/><circle cx="70" cy="114" r="5" fill="#4a2c1a" opacity="0.12"/>
  </svg>`;
}

export function mount(root, ctx) {
  const { voice, rng, shell, celebrate, testLog, wait } = ctx;
  const dif = ctx.difficulty('letras', 0, 3);
  let vivo = true;
  let rodada = null;
  let rodadaN = 0;
  let vitorias = 0;
  let prevAlvo;

  root.innerHTML = '';
  const tela = document.createElement('div');
  tela.className = 'letras';
  const figura = document.createElement('div');
  figura.className = 'figura';
  const ovos = document.createElement('div');
  ovos.className = 'ovos';
  const ninho = document.createElement('div');
  ninho.className = 'ninho';
  const mamae = emoji('1F995', 'mamae');
  ninho.append(mamae);
  tela.append(figura, ovos, ninho);
  root.append(tela);

  function instrucao() {
    return rodada.tipo === 'palavra' ? `letras.pergunta.${rodada.palavra.id}` : `letras.toque.${rodada.alvo.toLowerCase()}`;
  }

  async function novaRodada() {
    if (!vivo) return;
    shell.setBusy(true);
    dif.startRound();
    rodada = generateRound(dif.level, rng, prevAlvo);
    prevAlvo = rodada.alvo;
    rodadaN++;
    testLog.rodada = { n: rodadaN, tipo: rodada.tipo, alvo: rodada.alvo, opcoes: [...rodada.opcoes] };

    figura.innerHTML = '';
    if (rodada.tipo === 'palavra') {
      const img = emoji(rodada.palavra.emoji);
      figura.dataset.testid = 'figura';
      figura.append(img);
      figura.hidden = false;
      gsap.from(img, { scale: 0, duration: 0.4, ease: 'back.out(2)' });
    } else {
      delete figura.dataset.testid;
      figura.hidden = true;
    }

    ovos.innerHTML = '';
    rodada.opcoes.forEach((L, i) => {
      const b = document.createElement('button');
      b.className = 'ovo';
      b.dataset.testid = `ovo-${L}`;
      b.innerHTML = `${ovoSVG(CORES_OVO[(rodadaN + i) % CORES_OVO.length])}<span>${L}</span>`;
      onTap(b, () => tocarOvo(L, b), shell);
      ovos.append(b);
      gsap.from(b, { y: 40, opacity: 0, duration: 0.35, delay: i * 0.08, ease: 'back.out(2)' });
    });

    await wait(350);
    if (!vivo) return;
    await voice.say(instrucao());
    if (vivo) shell.setBusy(false);
  }

  async function chocar(b) {
    const cima = b.querySelector('.ovo-cima');
    const letra = b.querySelector('span');
    playSfx('pop');
    await new Promise((r) => {
      gsap.timeline({ onComplete: r })
        .to(b, { rotation: -8, duration: 0.07, yoyo: true, repeat: 3 })
        .to([cima, letra], { y: -60, x: 20, rotation: 35, opacity: 0, duration: 0.4, transformOrigin: '50% 100%' });
    });
    const bebe = emoji('1F995', 'bebe-nascendo');
    bebe.style.filter = `hue-rotate(${rng.int(0, 359)}deg)`;
    b.append(bebe);
    await new Promise((r) => gsap.from(bebe, { scale: 0, y: 30, duration: 0.45, ease: 'back.out(2.5)', onComplete: r }));
    return bebe;
  }

  async function tocarOvo(L, b) {
    voice.say(`letras.nome.${L.toLowerCase()}`, { interrupt: true });
    if (L === rodada.alvo) {
      shell.setBusy(true);
      dif.recordWin();
      vitorias++;
      const bebe = await chocar(b);
      await celebrate.small(bebe);
      const filhote = emoji('1F995', 'filhote');
      filhote.dataset.testid = 'filhote';
      filhote.style.filter = bebe.style.filter;
      ninho.append(filhote);
      const filhotes = ninho.querySelectorAll('.filhote');
      if (filhotes.length > MAX_FILHOTES) filhotes[0].remove();
      gsap.from(filhote, { scale: 0, duration: 0.3, ease: 'back.out(2)' });
      if (vitorias % 5 === 0) await celebrate.big();
      return novaRodada();
    }
    b.classList.remove('balanca'); void b.offsetWidth; b.classList.add('balanca');
    if (b.dataset.errado) return; // mesmo ovo errado de novo: não conta outro erro
    b.dataset.errado = '1';
    const { showHint } = dif.recordWrong();
    if (showHint) {
      ovos.querySelector(`[data-testid="ovo-${rodada.alvo}"]`)?.classList.add('dica');
      voice.say(rodada.tipo === 'palavra' ? `letras.dica.${rodada.palavra.id}` : instrucao());
    } else {
      voice.say(rng.pick(INCENTIVOS));
    }
  }

  novaRodada();
  return () => { vivo = false; };
}
