import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    setupFiles: ['src/test-setup.ts'],
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
  },
})
