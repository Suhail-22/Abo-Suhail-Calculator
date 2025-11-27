import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,ts,tsx}']
          },
          manifest: {
            name: 'Abo Suhail Calculator',
            short_name: 'ASC Calculator',
            description: 'Advanced PWA calculator with offline support',
            theme_color: '#050A14',
            background_color: '#050A14',
            display: 'standalone',
            orientation: 'portrait',
            lang: 'ar',
            dir: 'rtl',
            icons: [
              {
                src: '/assets/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/assets/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom']
            }
          }
        }
      }
    };
});