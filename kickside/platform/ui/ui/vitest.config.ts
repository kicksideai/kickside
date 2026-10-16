import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// appearance.vue imports the shared IconField from ../../widgets/ui/src, which
// imports @wippy-fe/proxy by bare specifier. Pin it to this package's install so
// the spec's vi.mock owns the single instance (see agents/ui for detail).
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@wippy-fe/proxy': resolve(__dirname, 'node_modules/@wippy-fe/proxy'),
      '@widgets': resolve(__dirname, '../../widgets/ui/src'),
    },
  },
  test: {
    setupFiles: ['src/test-setup.ts'],
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: { include: ['src/**'], reporter: ['text'], exclude: ['**/coverage/**', 'src/**/*.{test,spec}.ts', 'src/index.ts'] },
  },
})
