// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://crty.dev',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { theme: 'css-variables' },
  },
});
