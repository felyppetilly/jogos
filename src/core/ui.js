// Pequenos ajudantes de interface.
export const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';

export function emoji(code, classe = '') {
  const img = document.createElement('img');
  img.src = `${BASE}img/emoji/${code}.svg`;
  img.alt = '';
  img.draggable = false;
  if (classe) img.className = classe;
  return img;
}

// Toque imediato (pointerdown) que ignora toques enquanto o jogo está ocupado.
export function onTap(el, fn, shell) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (shell?.isBusy()) return;
    fn(e);
  });
}
