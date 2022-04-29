import cloudflare from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';
import { execSync } from 'child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),

  kit: {
    adapter: cloudflare(),
    prerender: {
      default: true,
      enabled: true
    },
    trailingSlash: 'always',
    vite: {
      define: {
        __BUILD_TIME__: execSync('date +%s').toString()
      }
    }
  }
};

export default config;
