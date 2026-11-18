// Testes do modo app/offline: precisam do build de produção com service worker.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: 'offline.spec.js',
  use: { baseURL: 'http://localhost:5200/' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 5200 --strictPort',
    url: 'http://localhost:5200/',
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [{ name: 'ipad', use: { ...devices['iPad (gen 7) landscape'] } }],
});
