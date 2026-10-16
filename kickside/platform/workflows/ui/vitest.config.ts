import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// Most of the suite is pure TypeScript (reducer, connect-validation, run mapping) and
// runs in a plain node environment. The run inspector also has a mount-level self-review
// (run-node-output.test.ts) that renders the real drawer against a captured run fixture;
// it opts into happy-dom per-file and needs the Vue SFC transform, so the plugin is wired
// here with the same custom-element rule the app build uses.
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('wc-') || tag.startsWith('kickside-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@widgets': resolve(__dirname, '../../widgets/ui/src'),
      primevue: resolve(__dirname, 'node_modules/primevue'),
    },
    dedupe: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
