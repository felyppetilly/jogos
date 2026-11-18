import { test, expect } from '@playwright/test';

// Roda contra o build de produção (npm run e2e:offline), não o servidor de dev.
test('funciona offline depois da 1ª visita', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 20000 });
  await context.setOffline(true);
  await page.reload();
  await page.getByTestId('comecar').click();
  await expect(page.getByTestId('cartao-letras')).toBeVisible();
  const ok = await page.evaluate(async () => (await fetch('audio/voz/inicio.oi.mp3')).ok);
  expect(ok).toBe(true);
});

test('manifest standalone em pt-BR', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const m = await page.evaluate(async (h) => (await fetch(h)).json(), href);
  expect(m.display).toBe('standalone');
  expect(m.lang).toBe('pt-BR');
  expect(m.icons.some((i) => i.sizes === '512x512')).toBe(true);
});

test('ícone da tela de início do iPhone/iPad existe', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  const ok = await page.evaluate(async (h) => (await fetch(h)).ok, href);
  expect(ok).toBe(true);
});
