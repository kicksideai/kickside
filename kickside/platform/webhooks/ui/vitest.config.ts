import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Test-only config: the build (vite.config.ts) ships a lib bundle; here we just
// need the Vue SFC compiler + a DOM so components can mount.
export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
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
