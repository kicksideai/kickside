import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    // The host packages reach for the Wippy proxy globals at import time, so
    // they are processed rather than externalized and the proxy mock applies.
    server: { deps: { inline: [/@wippy-fe\//] } },
  },
})
