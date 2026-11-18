import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH permite publicar numa subpasta (ex.: GitHub Pages em /jogos/).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jogos',
        short_name: 'Jogos',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'any',
        background_color: '#fff4e0',
        theme_color: '#fff4e0',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tudo, inclusive as vozes, fica guardado para jogar sem internet.
        globPatterns: ['**/*.{js,css,html,svg,png,mp3,json}'],
      },
    }),
  ],
});
