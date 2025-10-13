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
      strategies: 'injectManifest', // Usar Service Worker customizado
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg}'],
        globIgnores: ['**/sw.js'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/apiconta\.kingdevtec\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutos
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
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
        type: 'module'
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
    port: 3000,
    strictPort: true,
    open: true,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'contas.kingdevtec.com',
      'localhost',
      '127.0.0.1'
    ],
  }
})