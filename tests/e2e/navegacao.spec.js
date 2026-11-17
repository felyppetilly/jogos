import { test, expect } from '@playwright/test';
import { vozLog, dentroDaTela } from './helpers.js';

test('começar → menu → jogo → casinha', async ({ page }) => {
  await page.goto('/?teste=1');
  await page.getByTestId('comecar').click();
  await expect(page.getByTestId('cartao-musica')).toBeVisible();
  expect(await vozLog(page)).toContain('inicio.oi');
  await page.getByTestId('cartao-bolo').click();
  await expect(page).toHaveURL(/#\/bolo/);
  expect(await vozLog(page)).toContain('menu.bolo');
  await page.getByTestId('casinha').click();
  await expect(page.getByTestId('cartao-bolo')).toBeVisible();
});

test('botão de ouvir repete a última instrução', async ({ page }) => {
  await page.goto('/?teste=1');
  await page.getByTestId('comecar').click();
  await page.getByTestId('cartao-letras').click();
  await page.getByTestId('ouvir').click();
  const log = await vozLog(page);
  expect(log.filter((id) => id === 'menu.letras').length).toBeGreaterThanOrEqual(1);
});

test('cartões têm pelo menos 60px e cabem na tela', async ({ page }) => {
  await page.goto('/?teste=1');
  await page.getByTestId('comecar').click();
  const vp = page.viewportSize();
  for (const j of ['musica', 'letras', 'bolo']) {
    const box = await page.getByTestId(`cartao-${j}`).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(60);
    expect(box.height).toBeGreaterThanOrEqual(60);
    expect(dentroDaTela(box, vp)).toBe(true);
  }
});

test('não há links externos', async ({ page }) => {
  await page.goto('/?teste=1');
  await page.getByTestId('comecar').click();
  await expect(page.locator('a[href^="http"]')).toHaveCount(0);
});
