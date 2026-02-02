import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設置為空字串或 ./ 確保資源路徑是相對於 index.html 的
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 確保編譯過程不會因為小警告而停止
    emptyOutDir: true
  }
});