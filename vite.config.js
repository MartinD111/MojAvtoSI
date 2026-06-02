import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync } from 'node:fs';

// Per-page stylesheets (css/map.css, css/advanced-search.css, …) are loaded via a
// raw <link> inside dynamically-fetched view HTML, so Vite does NOT bundle them.
// In dev the root css/ folder is served directly; in the production build it must
// be copied into dist/ or those pages render unstyled. This plugin does that copy.
function copyCssFolder() {
  return {
    name: 'copy-css-folder',
    closeBundle() {
      if (existsSync('css')) {
        cpSync('css', 'dist/css', { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: './',
  root: '.',
  plugins: [react(), copyCssFolder()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
});
