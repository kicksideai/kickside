import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import build from './vite.config'
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: build.build.rollupOptions.external,
    alias: {
      '@wippy-fe/proxy': resolve(__dirname, 'node_modules/@wippy-fe/proxy'),
      '@wippy-fe/webcomponent-vue': resolve(__dirname, 'node_modules/@wippy-fe/webcomponent-vue'),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: { reporter: ['text'], include: ['src/**'], exclude: ['**/coverage/**', 'src/**/*.{test,spec}.ts', 'src/*.ts'] },
  },
})
