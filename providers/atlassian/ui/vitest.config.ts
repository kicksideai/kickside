import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  test: { environment: 'happy-dom', include: ['src/**/*.{test,spec}.ts'], coverage: { include: ['src/**'], reporter: ['text'], exclude: ['**/coverage/**', 'src/**/*.{test,spec}.ts', 'src/*.ts'] } },
})
