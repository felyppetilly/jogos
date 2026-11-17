// Moldura de todo jogo: casinha (volta ao menu), ouvido (repete a instrução)
// e o estado "ocupado", que bloqueia toques durante falas e animações.
import { emoji } from './ui.js';

export function createShell(root, { voice, onHome }) {
  root.innerHTML = '';
  root.classList.add('jogo');

  const conteudo = document.createElement('div');
  conteudo.className = 'jogo-conteudo';

  const casinha = botao('casinha', 'Voltar ao início', iconeCasa());
  const ouvir = botao('ouvir', 'Ouvir de novo', iconeOuvido());
  casinha.classList.add('canto', 'canto-esq');
  ouvir.classList.add('canto', 'canto-dir');

  let busy = false;
  let repetir = () => voice.repeatLast();

  casinha.addEventListener('pointerdown', (e) => { e.preventDefault(); voice.stop(); onHome(); });
  ouvir.addEventListener('pointerdown', (e) => { e.preventDefault(); repetir(); });

  root.append(conteudo, casinha, ouvir);

  return {
    el: conteudo,
    setBusy(b) { busy = !!b; root.classList.toggle('ocupado', busy); },
    isBusy: () => busy,
    onRepeat(fn) { repetir = fn; },
  };
}

function botao(testid, rotulo, svg) {
  const b = document.createElement('button');
  b.dataset.testid = testid;
  b.setAttribute('aria-label', rotulo);
  b.innerHTML = svg;
  return b;
}

function iconeCasa() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 30 32 10l24 20" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 28v24h12V40h10v12h12V28" fill="#ffd166" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/></svg>`;
}

function iconeOuvido() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 24h10l14-11v38L22 40H12z" fill="#7bdff2" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M44 22c4 6 4 14 0 20M50 16c7 9 7 23 0 32" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`;
}

export { emoji };
