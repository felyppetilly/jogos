// Menu: três cartões grandes, só com desenho. O toque fala o nome e abre o jogo.
import { emoji } from '../core/ui.js';

const CARTOES = [
  { jogo: 'musica', code: '1F3B9', cor: '#ffd6e0' },
  { jogo: 'letras', code: '1F995', cor: '#d3f8e2' },
  { jogo: 'bolo', code: '1F382', cor: '#fde2b3' },
];

export function mountMenu(root, { voice, onOpen }) {
  root.innerHTML = '';
  const menu = document.createElement('div');
  menu.className = 'menu';
  for (const { jogo, code, cor } of CARTOES) {
    const c = document.createElement('button');
    c.className = 'cartao';
    c.dataset.testid = `cartao-${jogo}`;
    c.style.background = cor;
    c.append(emoji(code));
    c.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      voice.say(`menu.${jogo}`, { interrupt: true });
      onOpen(jogo);
    });
    menu.append(c);
  }
  root.append(menu);
}
