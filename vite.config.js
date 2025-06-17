import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './forms',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'forms/index.html'),
        peptideInquiry: resolve(__dirname, 'forms/peptide-inquiry.html'),
        embed: resolve(__dirname, 'public/embed.js')
      }
    }
  },
  server: {
    port: 3000,
    cors: true
  }
});