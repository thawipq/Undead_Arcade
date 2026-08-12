import { defineConfig, loadEnv } from 'vite';
import { createBakeFaceMiddleware } from './server/bakeFace.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    cacheDir: '.vite-cache',
    server: {
      port: 5180,
      strictPort: true,
      open: true,
    },
    plugins: [
      {
        name: 'bake-face-api',
        configureServer(server) {
          server.middlewares.use(createBakeFaceMiddleware({
            openaiKey: env.OPENAI_API_KEY,
            geminiKey: env.GEMINI_API_KEY,
          }));
        },
      },
    ],
  };
});
