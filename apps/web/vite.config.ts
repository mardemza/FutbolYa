import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const apiHost = process.env.VITE_API_HOST ?? 'localhost'
const apiPort = Number(process.env.VITE_API_PORT ?? 3002)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: false,
      },
      includeAssets: [
        'favicon.svg',
        'favicon-32.png',
        'icons/apple-touch-icon.png',
        'splash/apple-splash-1170x2532.png',
        'splash/apple-splash-1290x2796.png',
      ],
      manifest: {
        name: 'FutbolYa — Panel de Torneos',
        short_name: 'FutbolYa',
        description: 'Panel de administración de torneos de fútbol',
        lang: 'es-AR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#006e2f',
        background_color: '#f8f9ff',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://${apiHost}:${apiPort}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://${apiHost}:${apiPort}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
