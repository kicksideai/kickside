import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: require.resolve('vue'),
      '@iconify/vue': require.resolve('@iconify/vue'),
      '@wippy-fe/proxy': resolve(__dirname, '../../node_modules/@wippy-fe/proxy'),
      '@wippy-fe/webcomponent-vue': resolve(__dirname, '../../node_modules/@wippy-fe/webcomponent-vue'),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['.smoke/kb10-frontend/test-setup.ts'],
    include: ['src/app/**/*.spec.ts'],
  },
})
