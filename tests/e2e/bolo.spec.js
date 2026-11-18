import { test, expect } from '@playwright/test';
import { abrir, vozLog, rodada, dentroDaTela } from './helpers.js';

const livre = (page) => expect(page.locator('#app.ocupado')).toHaveCount(0);

async function acertar(page) {
  await livre(page);
  const r = await rodada(page);
  await page.getByTestId(`numero-${r.resposta}`).click();
  return r;
}

test('somar: acertar ganha vela', async ({ page }) => {
  await abrir(page, 'bolo', { nivel: { bolo: 2 } });
  const r = await acertar(page);
  await page.waitForFunction((n) => window.__jogos.rodada.n > n, r.n);
  await expect(page.locator('.vela')).toHaveCount(1);
  expect((await vozLog(page)).some((id) => id.startsWith('elogio.'))).toBe(true);
  expect(await vozLog(page)).toContain(`bolo.caiu.${r.cobertura}.${r.b}`);
});

test('contar tocando conta uma vez cada', async ({ page }) => {
  await abrir(page, 'bolo', { nivel: { bolo: 1 } });
  await livre(page);
  const cob = page.getByTestId('cobertura');
  await cob.nth(0).click();
  await cob.nth(0).click();
  await cob.nth(1).click();
  const nums = (await vozLog(page)).filter((id) => id.startsWith('num.'));
  expect(nums.at(-1)).toBe('num.2');
  expect(nums).not.toContain('num.3');
});

test('número tocado é falado e o erro mostra dica no segundo', async ({ page }) => {
  await abrir(page, 'bolo', { nivel: { bolo: 1 } });
  await livre(page);
  const r = await rodada(page);
  const erradas = r.opcoes.filter((o) => o !== r.resposta);
  await page.getByTestId(`numero-${erradas[0]}`).click();
  expect(await vozLog(page)).toContain(`num.${erradas[0]}`);
  await livre(page);
  await page.getByTestId(`numero-${erradas[1]}`).click();
  await expect.poll(() => vozLog(page)).toContain('bolo.vamoscontar');
  await livre(page);
  expect((await rodada(page)).n).toBe(r.n);
});

test('5 acertos → assoprar vela toca parabéns', async ({ page }) => {
  await abrir(page, 'bolo', { nivel: { bolo: 1 } });
  for (let i = 0; i < 5; i++) {
    const r = await acertar(page);
    if (i < 4) await page.waitForFunction((n) => window.__jogos.rodada.n > n, r.n);
  }
  await expect.poll(() => vozLog(page)).toContain('bolo.pronto');
  await expect(page.locator('.vela')).toHaveCount(5);
  await page.getByTestId('velas').click();
  await expect.poll(() => vozLog(page)).toContain('bolo.parabens');
  await expect(page.locator('.vela')).toHaveCount(0, { timeout: 10000 });
});

test('girar o aparelho mantém coberturas tocáveis', async ({ page }) => {
  await abrir(page, 'bolo', { nivel: { bolo: 3 }, semente: 3 });
  await livre(page);
  const vp = page.viewportSize();
  for (const tam of [vp, { width: vp.height, height: vp.width }]) {
    await page.setViewportSize(tam);
    await page.waitForTimeout(200);
    const cobs = page.getByTestId('cobertura');
    const n = await cobs.count();
    expect(n).toBe((await rodada(page)).resposta);
    for (let i = 0; i < n; i++) {
      const box = await cobs.nth(i).boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(59);
      expect(dentroDaTela(box, tam)).toBe(true);
    }
    for (const o of (await rodada(page)).opcoes) {
      const box = await page.getByTestId(`numero-${o}`).boundingBox();
      expect(dentroDaTela(box, tam)).toBe(true);
    }
  }
});
