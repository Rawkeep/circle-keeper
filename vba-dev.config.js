// Minimal config to run VBA BEAST dev server from CK directory
import { defineConfig } from '/Users/z_rkb/Downloads/vba-workflow-pro/node_modules/vite/dist/node/index.js';

export default defineConfig({
  root: '/Users/z_rkb/Downloads/vba-workflow-pro',
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: '/Users/z_rkb/Downloads/vba-workflow-pro/index.html',
    },
  },
});
