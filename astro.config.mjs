import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
// import sitemap from '@astrojs/sitemap';

// Keystatic's admin UI needs a server. This single config supports THREE builds
// from one repo, chosen automatically by environment:
//
//   1. `npm run dev`                   -> local editing at /keystatic
//                                         (hybrid, no adapter, local storage)
//   2. Railway (KEYSTATIC_SERVER=true) -> always-on /keystatic Node server
//                                         (hybrid + node adapter, GitHub storage)
//   3. GitHub Pages (`npm run build`)  -> pure STATIC site, NO Keystatic, NO
//                                         adapter. The live site is unaffected.
const isServerCMS = process.env.KEYSTATIC_SERVER === 'true';
const isDev = process.env.npm_lifecycle_event === 'dev';
const enableKeystatic = isServerCMS || isDev;

export default defineConfig({
  site: 'https://klawagent.ai',
  output: enableKeystatic ? 'hybrid' : 'static',
  adapter: isServerCMS ? node({ mode: 'standalone' }) : undefined,
  integrations: [
    ...(enableKeystatic ? [react(), keystatic()] : []),
    // sitemap()
  ],
});
