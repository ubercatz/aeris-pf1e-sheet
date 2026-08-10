import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.js'),
      name: 'AerisPF1eSheet',
      formats: ['es'],
      fileName: () => 'aeris-pf1e-sheet.js'
    },
    rollupOptions: {
      external: ['aeris-core'],
    }
  }
});