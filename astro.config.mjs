// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://crty.dev',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  vite: { build: { assetsInlineLimit: 0 } },
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  markdown: {
    shikiConfig: { theme: 'css-variables' },
  },
});
