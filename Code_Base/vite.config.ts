import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/* `npm run dev`   : development server at http://localhost:5173
   `npm run build` : dist/index.html with the script and styles inlined, so the
                     build opens by double-click (file://) on the experience-centre
                     machine. Images stay as files beside it (public/ is copied). */
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist', emptyOutDir: true }
});
