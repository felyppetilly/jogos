import { test, expect } from '@playwright/test';
import { abrir, vozLog, rodada, dentroDaTela } from './helpers.js';

const livre = (page) => expect(page.locator('#app.ocupado')).toHaveCount(0);

test('acertar o ovo faz nascer filhote', async ({ page }) => {
  await abrir(page, 'letras');
  await livre(page);
  const r = await rodada(page);
  await page.getByTestId(`ovo-${r.alvo}`).click();
  await page.waitForFunction((n) => window.__jogos.rodada.n > n, r.n);
  const log = await vozLog(page);
  expect(log).toContain(`letras.nome.${r.alvo.toLowerCase()}`);
  expect(log.some((id) => id.startsWith('elogio.'))).toBe(true);
  await expect(page.getByTestId('filhote')).toHaveCount(1);
});

test('nível 1 pergunta pela palavra', async ({ page }) => {
  await abrir(page, 'letras', { nivel: { letras: 1 } });
  await livre(page);
  const r = await rodada(page);
  expect(r.tipo).toBe('palavra');
  expect((await vozLog(page)).some((id) => id.startsWith('letras.pergunta.'))).toBe(true);
  await expect(page.getByTestId('figura')).toBeVisible();
});

test('segundo erro mostra dica', async ({ page }) => {
  await abrir(page, 'letras');
  await livre(page);
  const r = await rodada(page);
  const erradas = r.opcoes.filter((o) => o !== r.alvo);
  await page.getByTestId(`ovo-${erradas[0]}`).click();
  await page.getByTestId(`ovo-${erradas[1]}`).click();
  await expect(page.getByTestId(`ovo-${r.alvo}`)).toHaveClass(/dica/);
});

test('tocar de novo no mesmo ovo errado não conta outro erro', async ({ page }) => {
  await abrir(page, 'letras');
  await livre(page);
  const r = await rodada(page);
  const errada = r.opcoes.find((o) => o !== r.alvo);
  await page.getByTestId(`ovo-${errada}`).click();
  await page.getByTestId(`ovo-${errada}`).click();
  await expect(page.getByTestId(`ovo-${r.alvo}`)).not.toHaveClass(/dica/);
});

test('toque duplo no ovo certo conta uma vez', async ({ page }) => {
  await abrir(page, 'letras');
  await livre(page);
  const r = await rodada(page);
  await page.getByTestId(`ovo-${r.alvo}`).evaluate((el) => {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await page.waitForFunction((n) => window.__jogos.rodada.n > n, r.n);
  await livre(page);
  await expect(page.getByTestId('filhote')).toHaveCount(1);
});

test('ovos cabem na tela', async ({ page }) => {
  await abrir(page, 'letras', { nivel: { letras: 2 } });
  await livre(page);
  const r = await rodada(page);
  const vp = page.viewportSize();
  for (const L of r.opcoes) {
    const box = await page.getByTestId(`ovo-${L}`).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(60);
    expect(dentroDaTela(box, vp)).toBe(true);
  }
});
