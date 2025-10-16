import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest', // Usar service worker customizado
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg}'],
        globIgnores: ['**/sw.js'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
      },
      manifest: {
        name: 'Cardeneta App',
        short_name: 'CardenetaApp',
        description: 'Sistema de gerenciamento de contas pessoais',
        start_url: '/',
        theme_color: '#000000',
        background_color: '#000000',
        scope: '/',
        orientation: 'portrait',
        lang: 'pt-BR',
        display: 'standalone',
        categories: ['finance', 'productivity'],
        gcm_sender_id: '103953800507', // ID padrão do FCM para VAPID
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            // 'maskable' permite que o Android adapte seu ícone para diferentes formas.
            purpose: 'any maskable',
          },
        ],
        prefer_related_applications: false,

      },
      // Configurações de desenvolvimento
      devOptions: {
        enabled: true, // Habilita PWA em desenvolvimento
        type: 'module',
        suppressWarnings: true,
      }
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    open: false, // Desabilita abertura automática do navegador
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    allowedHosts: [
      'contas.kingdevtec.com',
      'localhost',
      '127.0.0.1'
    ],
  }
})