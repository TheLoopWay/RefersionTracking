import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: './forms',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'forms/index.html'),
        peptideInquiry: resolve(__dirname, 'forms/peptide-inquiry.html'),
        consultation: resolve(__dirname, 'forms/consultation.html')
      }
    }
  },
  server: {
    port: 3000,
    cors: true
  }
});