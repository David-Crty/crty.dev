// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://crty.dev',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { theme: 'css-variables' },
  },
});
