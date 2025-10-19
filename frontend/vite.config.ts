import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { VitePWA } from 'vite-plugin-pwa' // DESABILITADO - Conflito com Firebase SW

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['firebase/app', 'firebase/messaging', 'firebase/analytics']
  },
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    // VitePWA DESABILITADO - Causa conflito com firebase-messaging-sw.js
    // O Firebase gerencia seu próprio Service Worker
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