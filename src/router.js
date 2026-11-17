// Rotas por hash: #/musica, #/letras, #/bolo. Qualquer outra coisa é o menu.
export const ROTAS = ['musica', 'letras', 'bolo'];

export function parseRoute(hash) {
  const nome = String(hash || '').replace(/^#\/?/, '').split(/[/?]/)[0];
  return ROTAS.includes(nome) ? nome : 'menu';
}

export function navigate(route) {
  location.hash = route === 'menu' ? '#/' : `#/${route}`;
}
