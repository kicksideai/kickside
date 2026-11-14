import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Test-only config: the build (vite.config.ts) ships a lib bundle; here we just
// need the Vue SFC compiler + a DOM so components can mount.
export default defineConfig({
  resolve: {
    // Shared widget source resolves bare imports from the widgets package. A build has one
    // instance of each, so these pin them to this package's install, where test-setup mocks them.
    dedupe: ['vue', 'primevue'],
    alias: {
      '@widgets': resolve(__dirname, '../../widgets/ui/src'),
      '@wippy-fe/proxy': resolve(__dirname, 'node_modules/@wippy-fe/proxy'),
    },
  },
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      include: ['src/**'],
      reporter: ['text'], exclude: ['**/coverage/**', 'src/**/*.{test,spec}.ts', 'src/index.ts', 'src/index-installed.ts'],
    },
  },
})
