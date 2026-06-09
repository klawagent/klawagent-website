import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
// import sitemap from '@astrojs/sitemap';

// The Keystatic Admin UI needs server-side code, but this site deploys to
// STATIC GitHub Pages. So Keystatic + React load ONLY during `npm run dev`
// (local editing at http://localhost:4321/keystatic). `npm run build` — which
// is what CI/GitHub Pages runs — stays a pure static build with no adapter.
const enableKeystatic = process.env.npm_lifecycle_event === 'dev';

export default defineConfig({
  site: 'https://klawagent.ai',
  // Keystatic's admin routes are server-rendered. Switch to hybrid ONLY in dev
  // (no adapter needed for `astro dev`); build stays pure static for Pages.
  output: enableKeystatic ? 'hybrid' : 'static',
  integrations: [
    ...(enableKeystatic ? [react(), keystatic()] : []),
    // sitemap()
  ],
});
