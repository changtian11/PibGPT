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
  build: {
    outDir: path.join(__dirname, '..', 'server', 'public'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        register: path.resolve(__dirname, 'register.html'),
        bot: path.resolve(__dirname, 'bot.html')
      }
    },
    sourcemap: true,
    assetsDir:"./assets"
  }
})
