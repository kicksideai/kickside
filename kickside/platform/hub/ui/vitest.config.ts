import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Test-only config: the build (vite.config.ts) ships a lib bundle; here we just
// need the Vue SFC compiler + a DOM so components can mount.
export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') }, dedupe: ['vue', 'primevue', '@iconify/vue'] },
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.ts'],
    // Order matters: the proxy/host mock (test-setup) must register before the
    // PrimeVue plugin bridge (vitest.setup) installs into the test app.
    setupFiles: ['src/test-setup.ts', './vitest.setup.ts'],
    coverage: {
      include: ['src/**'],
      reporter: ['text'], exclude: ['**/coverage/**', 'src/**/*.{test,spec}.ts', 'src/index.ts', 'src/index-installed.ts', 'src/test-setup.ts'],
    },
  },
})
