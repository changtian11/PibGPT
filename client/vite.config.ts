import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 4000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: false,
      },
      '/static': {
        target: 'http://localhost:3000',
        changeOrigin: false,
      }
    }
  },
  build: {
    outDir: path.join(__dirname, '..', 'server', 'public'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        register: path.resolve(__dirname, 'register.html'),
        bot: path.resolve(__dirname, 'bot.html')
      }
    },
    sourcemap: true
  }
})
