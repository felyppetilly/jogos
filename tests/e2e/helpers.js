export const vozLog = (page) => page.evaluate(() => window.__jogos.vozLog);
export const rodada = (page) => page.evaluate(() => window.__jogos.rodada);

export async function abrir(page, rota = '', { nivel = {}, semente = 1 } = {}) {
  await page.addInitScript((niveis) => {
    for (const [jogo, n] of Object.entries(niveis)) localStorage.setItem(`jogos.nivel.${jogo}`, String(n));
  }, nivel);
  await page.goto(`/?teste=1&semente=${semente}${rota ? '#/' + rota : ''}`);
  await page.getByTestId('comecar').click();
}

export function dentroDaTela(box, vp) {
  return box && box.x >= -1 && box.y >= -1 && box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1;
}
