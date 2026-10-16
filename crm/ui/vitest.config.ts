import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('kickside-') || tag.startsWith('kickside-') || tag.startsWith('wc-') } } })],
  resolve: {
    alias: {
      '@wippy-fe/webcomponent-vue': resolve(__dirname, 'node_modules/@wippy-fe/webcomponent-vue'),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['src/test-setup.ts'],
    coverage: { reporter: ['text'], include: ['src/app/**'], exclude: ['src/**/*.{test,spec}.ts'] },
  },
})
