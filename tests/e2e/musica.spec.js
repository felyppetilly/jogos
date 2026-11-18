import { test, expect } from '@playwright/test';
import { abrir, vozLog, rodada, dentroDaTela } from './helpers.js';

const livre = (page) => expect(page.locator('#app.ocupado')).toHaveCount(0);

async function tocarSeq(page, seq) {
  for (const k of seq) await page.getByTestId(`tecla-${k}`).click();
}

test('acertar a sequência comemora e gera outra', async ({ page }) => {
  await abrir(page, 'musica');
  await livre(page);
  const r1 = await rodada(page);
  await tocarSeq(page, r1.seq);
  await page.waitForFunction((n) => window.__jogos.rodada.n > n, r1.n);
  expect((await vozLog(page)).some((id) => id.startsWith('elogio.'))).toBe(true);
});

test('errar repete a mesma sequência', async ({ page }) => {
  await abrir(page, 'musica');
  await livre(page);
  const r1 = await rodada(page);
  const errada = r1.seq[0] === 0 ? 1 : 0;
  await page.getByTestId(`tecla-${errada}`).click();
  await expect.poll(() => vozLog(page)).toContain('musica.denovo');
  await livre(page);
  const r2 = await rodada(page);
  expect(r2.n).toBe(r1.n);
  expect(r2.seq).toEqual(r1.seq);
});

test('toques durante a reprodução são ignorados', async ({ page }) => {
  await page.goto('/?teste=1&acelera=1#/musica');
  await page.getByTestId('comecar').click();
  await expect(page.locator('#app.ocupado')).toHaveCount(1);
  const r1 = await rodada(page);
  const errada = r1.seq[0] === 0 ? 1 : 0;
  await page.getByTestId(`tecla-${errada}`).click();
  await livre(page);
  await tocarSeq(page, r1.seq);
  await page.waitForFunction((n) => window.__jogos.rodada.n > n, r1.n, { timeout: 15000 });
  expect(await vozLog(page)).not.toContain('musica.denovo');
});

test('modo livre: teclas só tocam, sem rodada', async ({ page }) => {
  await abrir(page, 'musica');
  await livre(page);
  const r1 = await rodada(page);
  await page.getByTestId('tocar-livre').click();
  expect(await vozLog(page)).toContain('musica.livre');
  for (let i = 0; i < 4; i++) await page.getByTestId('tecla-0').click();
  expect(await vozLog(page)).not.toContain('musica.denovo');
  expect((await rodada(page)).n).toBe(r1.n);
});

test('5 teclas cabem na tela no nível 5', async ({ page }) => {
  await abrir(page, 'musica', { nivel: { musica: 5 } });
  const vp = page.viewportSize();
  for (let i = 0; i < 5; i++) {
    const box = await page.getByTestId(`tecla-${i}`).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(60);
    expect(dentroDaTela(box, vp)).toBe(true);
  }
});

const toque = (page, testid) => page.evaluate((id) => {
  document.querySelector(`[data-testid="${id}"]`)
    .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
}, testid);

test('ligar o modo livre logo depois de errar não deixa as teclas mortas', async ({ page }) => {
  await abrir(page, 'musica');
  await livre(page);
  const r1 = await rodada(page);
  const errada = r1.seq[0] === 0 ? 1 : 0;
  await toque(page, `tecla-${errada}`);
  await toque(page, 'tocar-livre');
  await page.waitForTimeout(800);
  await expect(page.getByTestId('tocar-livre')).toHaveClass(/ativo/);
  await livre(page);
});

test('ligar e desligar o livre na apresentação não duplica a sequência', async ({ page }) => {
  await page.goto('/?teste=1&acelera=1#/musica');
  await page.getByTestId('comecar').click();
  await expect(page.locator('#app.ocupado')).toHaveCount(1);
  await toque(page, 'tocar-livre');
  await toque(page, 'tocar-livre');
  await livre(page);
  await page.waitForTimeout(1500);
  const suavez = (await vozLog(page)).filter((id) => id === 'musica.suavez');
  expect(suavez.length).toBe(1);
});
