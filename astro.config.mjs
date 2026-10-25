// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://crty.dev',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
