import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // ... all your existing build settings remain untouched down here
    // ... keep all your existing build and rollupOptions settings down here!
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