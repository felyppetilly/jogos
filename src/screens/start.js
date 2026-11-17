// Tela de início: um botão gigante. O primeiro toque libera o áudio no iOS.
export function mountStart(root, { onStart }) {
  root.innerHTML = '';
  const tela = document.createElement('div');
  tela.className = 'tela-inicio';

  const btn = document.createElement('button');
  btn.dataset.testid = 'comecar';
  btn.className = 'botao-comecar';
  btn.setAttribute('aria-label', 'Começar');
  btn.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#ff6b6b"/><path d="M40 28 L74 50 L40 72 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></svg>`;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); onStart(); }, { once: true });
  tela.append(btn);

  const ua = navigator.userAgent;
  const ehIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const instalado = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if (ehIOS && !instalado) {
    const dica = document.createElement('p');
    dica.className = 'dica-instalar';
    dica.dataset.testid = 'dica-instalar';
    dica.textContent = 'Para instalar: toque em Compartilhar e depois em Adicionar à Tela de Início.';
    tela.append(dica);
  }
  root.append(tela);
}
