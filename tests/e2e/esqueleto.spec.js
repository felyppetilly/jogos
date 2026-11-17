import { test, expect } from '@playwright/test';

test('carrega e expõe o modo de teste', async ({ page }) => {
  await page.goto('/?teste=1&semente=7');
  await expect(page.locator('#app')).toBeAttached();
  expect(await page.evaluate(() => Array.isArray(window.__jogos?.vozLog))).toBe(true);
});
