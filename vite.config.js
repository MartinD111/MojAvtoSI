import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync } from 'node:fs';

// Active platform, selected at build time: VITE_PLATFORM=avto|navtika (default avto).
const PLATFORM = process.env.VITE_PLATFORM || 'avto';
const OUT_DIR = `dist-${PLATFORM}`;

// Compute base path based on environment and platform
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const REPO_NAME = 'MojAvtoSI';
const BASE_URL = isGitHubActions
  ? (PLATFORM === 'navtika' ? `/${REPO_NAME}/navtika/` : `/${REPO_NAME}/`)
  : '/';

// Static <title>/<meta> per platform, injected into index.html placeholders.
// (Kept inline here because vite.config runs in plain Node and cannot read the
// ESM src/config/platform.js with import.meta.env.)
const HTML_META = {
  avto: {
    title: 'MojAvto.si — Nakup in prodaja vozil',
    description: 'MojAvto.si — spletni oglasnik vozil. Kupujte, prodajajte in predstavite svoje vozilo.',
  },
  navtika: {
    title: 'MojaNavtika.si — Nakup, prodaja in najem plovil',
    description: 'MojaNavtika.si — spletni oglasnik plovil. Čolni, jadrnice, gumenjaki, jet-ski in izvenkrmni motorji za prodajo in najem.',
  },
};

// Replace %APP_TITLE% / %APP_DESCRIPTION% / %APP_BASE_URL% placeholders in index.html.
function injectHtmlMeta() {
  const meta = HTML_META[PLATFORM] || HTML_META.avto;
  return {
    name: 'inject-html-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('%APP_TITLE%', meta.title)
        .replaceAll('%APP_DESCRIPTION%', meta.description)
        .replaceAll('%APP_BASE_URL%', BASE_URL);
    },
  };
}

// Per-page stylesheets (css/map.css, css/advanced-search.css, …) are loaded via a
// raw <link> inside dynamically-fetched view HTML, so Vite does NOT bundle them.
// In dev the root css/ folder is served directly; in the production build it must
// be copied into the platform output dir or those pages render unstyled.
// (public/* — json, lang, views, images, icons — is copied automatically by Vite's
// default publicDir handling.)
function copyCssFolder() {
  return {
    name: 'copy-css-folder',
    closeBundle() {
      if (existsSync('css')) {
        cpSync('css', `${OUT_DIR}/css`, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: BASE_URL,
  root: '.',
  define: {
    // Statically inject the active platform so src/config/platform.js can read it.
    'import.meta.env.VITE_PLATFORM': JSON.stringify(PLATFORM),
  },
  plugins: [react(), injectHtmlMeta(), copyCssFolder()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
