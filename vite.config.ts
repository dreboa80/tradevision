import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // loadEnv reads from .env* files; on Vercel, prefer process.env as well.
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    const model = env.GEMINI_MODEL || process.env.GEMINI_MODEL || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_MODEL': JSON.stringify(model)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
