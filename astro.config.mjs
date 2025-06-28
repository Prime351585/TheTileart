// @ts-check
import { defineConfig } from 'astro/config';
import { envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  server: {
    host: true
  },

  // output:"server",
  env: {
    schema: {
      WP_USERNAME: envField.string({ context: "server", access: "secret" }),
      WP_APP_PASSWORD: envField.string({ context: "server", access: "secret" }),
      GRAPH_QL_LINK: envField.string({ context: "server", access: "secret" })
    }
  },

  integrations: [sitemap()]
});