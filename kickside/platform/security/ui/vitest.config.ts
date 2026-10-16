import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: { dedupe: ['vue', 'primevue'], alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src'), '@wippy-fe/proxy': resolve(__dirname, 'node_modules/@wippy-fe/proxy') } },
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
